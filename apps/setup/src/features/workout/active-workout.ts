// Pure logic for building/advancing an ActiveWorkout and resolving what
// weight to prefill a set with — kept out of the hook/page so it's
// independently testable and so the hook stays about React state, not
// domain rules.

import type { Activity } from '@/domain/activity';
import type { Exercise, SuggestedLoad } from '@/domain/exercise';
import type { ExercisePrescription, PlannedExercise, TrainingDay, WarmupCooldownExercise } from '@/domain/plan';
import type { ActiveExercise, ActiveWorkout, CompletedSet, WorkoutPhase } from '@/domain/workout';

export function createActiveWorkout(planId: string, day: TrainingDay, activities: Activity[]): ActiveWorkout {
  const flatten = (entries: (WarmupCooldownExercise | PlannedExercise)[]) =>
    entries.flatMap((entry) => toActiveExercises(entry, activities));
  const warmup = flatten(day.warmup);
  const exercises = flatten(day.exercises);
  const cooldown = flatten(day.cooldown);
  const phase: WorkoutPhase = warmup.length > 0 ? 'warmup' : exercises.length > 0 ? 'main' : 'cooldown';
  return {
    planId,
    trainingDayId: day.id,
    startedAt: new Date().toISOString(),
    elapsedSeconds: 0,
    phase,
    currentExerciseIndex: 0,
    warmup,
    exercises,
    cooldown,
  };
}

function isSideMode(mode: ExercisePrescription['mode']): boolean {
  return mode === 'reps-side' || mode === 'reps-weight-side' || mode === 'duration-side';
}

// A *-side PlannedExercise becomes two separate steps (left pass, then
// right pass) rather than one step with doubled rows — see
// domain/workout.ts's CompletedSet/ActiveExercise comments for why.
function toActiveExercises(
  entry: WarmupCooldownExercise | PlannedExercise,
  activities: Activity[],
): ActiveExercise[] {
  if (!isSideMode(entry.prescription.mode)) {
    return [{ exerciseId: entry.exerciseId, sets: buildInitialSets(entry.exerciseId, entry.prescription, activities, undefined) }];
  }
  return (['left', 'right'] as const).map((side) => ({
    exerciseId: entry.exerciseId,
    side,
    sets: buildInitialSets(entry.exerciseId, entry.prescription, activities, side),
  }));
}

// Orientative reps default — the midpoint of the prescribed range. Real
// programmed data, not a guess, so this doesn't run into "no fake
// precision" (spec §16): the range itself is approved, we're just picking
// a sensible single starting number inside it instead of leaving the
// field empty.
function repMidpoint(range: [number, number]): number {
  return Math.round((range[0] + range[1]) / 2);
}

// Builds the rows for ONE step — `prescription.sets` rows, all sharing
// the same `side` when this is a *-side exercise (undefined otherwise).
// Never doubled: a 3-set prescription always produces exactly 3 rows,
// whichever side this step is.
//
// Reps/duration always start prefilled with the prescribed orientative
// value (never blank — spec §8.3's own example shows populated rows).
// Weight only prefills when resolveInitialWeight actually has something
// to offer (history or a curated suggestedLoad); otherwise it starts
// unset, per spec §8.2's explicit "no history yet" exception — showing 0
// would be fake precision, an empty field is the honest state.
function buildInitialSets(
  exerciseId: string,
  prescription: ExercisePrescription,
  activities: Activity[],
  side: 'left' | 'right' | undefined,
): CompletedSet[] {
  const mode = prescription.mode;
  const sets: CompletedSet[] = [];

  for (let i = 0; i < prescription.sets; i++) {
    const setNumber = i + 1;
    const weight =
      mode === 'reps-weight' || mode === 'reps-weight-side' || mode === 'duration-weight'
        ? resolveInitialWeight(exerciseId, setNumber, side, prescription, activities)
        : undefined;
    switch (mode) {
      case 'reps':
        sets.push({ mode, setNumber, completed: false, reps: repMidpoint(prescription.repRange) });
        break;
      case 'reps-weight':
        sets.push({ mode, setNumber, completed: false, reps: repMidpoint(prescription.repRange), weight });
        break;
      case 'reps-side':
        // side is always defined here — toActiveExercises only reaches
        // this branch via the *-side fan-out above.
        sets.push({ mode, setNumber, side: side!, completed: false, reps: repMidpoint(prescription.repRange) });
        break;
      case 'reps-weight-side':
        sets.push({ mode, setNumber, side: side!, completed: false, reps: repMidpoint(prescription.repRange), weight });
        break;
      case 'duration':
        sets.push({ mode, setNumber, completed: false, durationSeconds: prescription.durationSeconds });
        break;
      case 'duration-weight':
        sets.push({ mode, setNumber, completed: false, durationSeconds: prescription.durationSeconds, weight });
        break;
      case 'duration-side':
        sets.push({ mode, setNumber, side: side!, completed: false, durationSeconds: prescription.durationSeconds });
        break;
    }
  }

  return sets;
}

export function phaseList(workout: ActiveWorkout, phase: WorkoutPhase): ActiveExercise[] {
  if (phase === 'warmup') return workout.warmup;
  if (phase === 'cooldown') return workout.cooldown;
  return workout.exercises;
}

const PHASE_ORDER: WorkoutPhase[] = ['warmup', 'main', 'cooldown'];

// Where to go after the current exercise — next exercise in this phase,
// or the first exercise of the next non-empty phase, or null if this was
// the last exercise of the whole workout (caller navigates to Completion).
export function nextPosition(workout: ActiveWorkout): { phase: WorkoutPhase; index: number } | null {
  const currentList = phaseList(workout, workout.phase);
  if (workout.currentExerciseIndex + 1 < currentList.length) {
    return { phase: workout.phase, index: workout.currentExerciseIndex + 1 };
  }
  const currentOrderIndex = PHASE_ORDER.indexOf(workout.phase);
  for (let i = currentOrderIndex + 1; i < PHASE_ORDER.length; i++) {
    const candidate = PHASE_ORDER[i];
    if (phaseList(workout, candidate).length > 0) return { phase: candidate, index: 0 };
  }
  return null;
}

// Symmetric with nextPosition — previous exercise in this phase, or the
// last exercise of the previous non-empty phase, or null if this was the
// first exercise of the whole workout (caller disables/no-ops Back).
export function previousPosition(workout: ActiveWorkout): { phase: WorkoutPhase; index: number } | null {
  if (workout.currentExerciseIndex - 1 >= 0) {
    return { phase: workout.phase, index: workout.currentExerciseIndex - 1 };
  }
  const currentOrderIndex = PHASE_ORDER.indexOf(workout.phase);
  for (let i = currentOrderIndex - 1; i >= 0; i--) {
    const candidate = PHASE_ORDER[i];
    const list = phaseList(workout, candidate);
    if (list.length > 0) return { phase: candidate, index: list.length - 1 };
  }
  return null;
}

function suggestedLoadToNumber(load: SuggestedLoad): number | undefined {
  switch (load.type) {
    case 'two-dumbbells':
      return load.weightPerDumbbell;
    case 'single-dumbbell':
    case 'barbell':
    case 'machine':
    case 'cable':
      return load.weight;
    case 'bodyweight':
      return undefined;
  }
}

// Preserves the full load-type semantics through to display — never a
// bare number (see domain/exercise.ts's SuggestedLoad comment). Matches
// the approved format exactly: two-dumbbells is the one type whose
// number means something different per side, so it's the one case
// spelled out as a multiplication rather than a suffix.
export function formatSuggestedLoad(load: SuggestedLoad): string | undefined {
  switch (load.type) {
    case 'two-dumbbells':
      return `2 × ${load.weightPerDumbbell} kg`;
    case 'single-dumbbell':
    case 'machine':
    case 'cable':
      return `${load.weight} kg`;
    case 'barbell':
      return `${load.weight} kg total`;
    case 'bodyweight':
      return undefined;
  }
}

// HISTORY OVERRIDE (approved): the most recent COMPLETED session's actual
// weight for the corresponding set is the default; only falls back to the
// plan's curated suggestedLoad (training/rules/starting-load.ts) if no
// matching completed previous set exists. No numeric formula, no
// progression, no averaging/smoothing — just "what did they actually
// lift last time, for this exact set." An in-progress/unfinished set is
// never counted as history (added 2026-08-19 — a set the user never
// confirmed shouldn't become next session's starting point).
export function resolveInitialWeight(
  exerciseId: string,
  setNumber: number,
  side: 'left' | 'right' | undefined,
  prescription: ExercisePrescription,
  activities: Activity[],
): number | undefined {
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );

  for (const activity of sortedActivities) {
    // Match on side too — a *-side exercise saves two entries per
    // activity (one per step), both sharing the same exerciseId.
    const match = [...activity.warmup, ...activity.exercises, ...activity.cooldown].find(
      (entry) => entry.exerciseId === exerciseId && entry.side === side,
    );
    if (!match) continue;
    const matchingSet = match.sets.find((set) => set.setNumber === setNumber);
    if (matchingSet && matchingSet.completed && 'weight' in matchingSet && matchingSet.weight !== undefined) {
      return matchingSet.weight;
    }
    // Most recent session that included this exercise, even without a
    // matching completed weighted set — stop here rather than searching
    // further back; "previous workout" means the last one, not a deep
    // history scan.
    break;
  }

  return 'suggestedLoad' in prescription && prescription.suggestedLoad
    ? suggestedLoadToNumber(prescription.suggestedLoad)
    : undefined;
}

// Combines resolveInitialWeight (the number) with the exercise's own
// permanent load-type tag (exercise.startingLoad?.type — see
// domain/exercise.ts's SuggestedLoad comment) into the fully-formatted
// display string, whether the number came from history or the curated
// reference. The load KIND is a property of the exercise, not of any one
// data point, so it's always re-derived here rather than stored per set
// (CompletedSet.weight stays a bare number — see domain/workout.ts).
export function resolveInitialWeightDisplay(
  exercise: Exercise,
  setNumber: number,
  side: 'left' | 'right' | undefined,
  prescription: ExercisePrescription,
  activities: Activity[],
): string | undefined {
  const weight = resolveInitialWeight(exercise.id, setNumber, side, prescription, activities);
  if (weight === undefined) return undefined;
  const loadType = exercise.startingLoad?.type;
  if (!loadType || loadType === 'bodyweight') return undefined;
  const load: SuggestedLoad =
    loadType === 'two-dumbbells' ? { type: loadType, weightPerDumbbell: weight, unit: 'kg' } : { type: loadType, weight, unit: 'kg' };
  return formatSuggestedLoad(load);
}

export function exerciseLookup(library: Exercise[]): Map<string, Exercise> {
  return new Map(library.map((exercise) => [exercise.id, exercise]));
}

export function formatElapsed(totalSeconds: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// Looks up by exerciseId, not index — a *-side exercise occupies two
// consecutive steps in the (expanded) active list but only one entry in
// day.<phase>, so the two arrays are no longer index-aligned.
export function entryAt(
  day: TrainingDay,
  phase: WorkoutPhase,
  exerciseId: string,
): WarmupCooldownExercise | PlannedExercise | undefined {
  const list = phase === 'warmup' ? day.warmup : phase === 'cooldown' ? day.cooldown : day.exercises;
  return list.find((e) => e.exerciseId === exerciseId);
}
