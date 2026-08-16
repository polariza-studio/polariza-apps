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

// HISTORY OVERRIDE (approved): the most recent completed session's actual
// weight for the corresponding set is the default; only falls back to the
// plan's curated suggestedLoad if no matching previous set exists. No
// numeric formula, no progression — just "what did they actually lift
// last time, for this exact set". `suggestedLoad` is currently always
// undefined in production (the curated table isn't wired in yet — see
// Exercise.startingLoad's comment), so today this always resolves to
// undefined for a first-time exercise, which is correct: an empty input
// is exactly what "no fake precision" calls for until either history or
// the curated table actually has something to offer.
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
    if (matchingSet && 'weight' in matchingSet && matchingSet.weight !== undefined) {
      return matchingSet.weight;
    }
    // Most recent session that included this exercise, even without a
    // matching weighted set — stop here rather than searching further
    // back; "previous workout" means the last one, not a deep history scan.
    break;
  }

  return 'suggestedLoad' in prescription && prescription.suggestedLoad
    ? suggestedLoadToNumber(prescription.suggestedLoad)
    : undefined;
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
