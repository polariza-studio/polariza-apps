// Stage 5: fill each role-tagged slot with an approved exercise from the
// library — filtered by equipment, experience-appropriate difficulty, and
// programming category (warm-up/cool-down exercises are library content
// for the Technique UI and future use, not candidates the generator
// programs into a session); ranked by fit with focus/deprioritized areas,
// role/strengthType match, goal, functional overlap with what's already
// in the session, and how often it's already been used elsewhere in the
// week. A slot with no compatible candidate is dropped rather than
// failing the whole plan; validate-plan.ts is what ultimately rejects a
// plan left with a required pattern unfilled.
//
// findExerciseForSlot is exported so session-quality-pass.ts's
// replace-before-remove can reuse the exact same candidate-filter/ranking
// logic (with excludeSystemicHigh set) instead of duplicating it — a
// substitute search is the same problem as the original selection, just
// with one extra constraint.

import type {
  Equipment,
  ExperienceLevel,
  Goal,
  OnboardingAnswers,
} from '../../domain/onboarding';
import type { DemandLevel, Exercise, MovementPattern, MuscleGroup } from '../../domain/exercise';
import type { PatternSlot, PrioritizedDayPlan } from './apply-priorities';
import type { ExerciseRole } from '../rules/goals';
import { resolveAvailableEquipment } from '../rules/equipment';
import { experienceRules } from '../rules/experience';
import { functionalOverlap } from './functional-overlap';

const difficultyRank: Record<Exercise['difficulty'], number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

const demandRank: Record<DemandLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export type SelectedExercise = { exercise: Exercise; slot: PatternSlot };

export type SelectedDayPlan = {
  name: string;
  exercises: SelectedExercise[];
};

export function selectExercises(
  days: PrioritizedDayPlan[],
  answers: OnboardingAnswers,
  exerciseLibrary: Exercise[],
): SelectedDayPlan[] {
  const availableEquipment = resolveAvailableEquipment(
    answers.trainingEnvironment,
    answers.equipment,
  );
  const maxDifficultyRank = difficultyRank[experienceRules[answers.experience].maxDifficulty];

  // Tracked across the whole week (not reset per day) so ranking can
  // mildly discourage — without banning — using the identical exercise in
  // every single session. Legitimate repeats (e.g. squat as the main lift
  // on two different days) stay possible, just slightly less favored the
  // more they're reused.
  const weekUsage = new Map<string, number>();

  return days.map((day) => {
    // Avoid repeating the same exercise twice within one day; reuse across
    // different days in the week is fine and normal in real programming.
    const usedInDay = new Set<string>();
    // The actual Exercise objects selected so far this day (not just
    // their IDs) — rank() uses this to prefer a functionally-
    // complementary candidate over one that overlaps heavily with
    // something already in the session (see functional-overlap.ts).
    const selectedInDay: Exercise[] = [];
    const exercises: SelectedExercise[] = [];

    for (const slot of day.slots) {
      const exercise = findExerciseForSlot(
        slot,
        exerciseLibrary,
        availableEquipment,
        maxDifficultyRank,
        answers.goal,
        answers.experience,
        usedInDay,
        weekUsage,
        { selectedInDay },
      );
      if (exercise) {
        exercises.push({ exercise, slot });
        usedInDay.add(exercise.id);
        selectedInDay.push(exercise);
        weekUsage.set(exercise.id, (weekUsage.get(exercise.id) ?? 0) + 1);
      }
    }

    return { name: day.name, exercises };
  });
}

export function findExerciseForSlot(
  slot: { pattern: MovementPattern; role: ExerciseRole; preferredMuscles: MuscleGroup[]; avoidMuscles: MuscleGroup[] },
  library: Exercise[],
  availableEquipment: Equipment[],
  maxDifficultyRank: number,
  goal: Goal,
  experience: ExperienceLevel,
  excludeIds: Set<string>,
  weekUsage: Map<string, number>,
  options: { excludeSystemicHigh?: boolean; selectedInDay?: Exercise[] } = {},
): Exercise | null {
  const candidates = library.filter(
    (exercise) =>
      exercise.category !== 'warmup' &&
      exercise.category !== 'cooldown' &&
      exercise.movementPattern === slot.pattern &&
      difficultyRank[exercise.difficulty] <= maxDifficultyRank &&
      exercise.equipment.every((eq) => availableEquipment.includes(eq)) &&
      !excludeIds.has(exercise.id) &&
      (!options.excludeSystemicHigh || exercise.demands.systemic !== 'high'),
  );

  if (candidates.length === 0) return null;

  const selectedInDay = options.selectedInDay ?? [];
  const ranked = [...candidates].sort(
    (a, b) =>
      rank(b, slot, goal, experience, weekUsage, selectedInDay) -
      rank(a, slot, goal, experience, weekUsage, selectedInDay),
  );
  return ranked[0];
}

// Goal fit is a ranking preference, not a hard filter — a hard filter could
// leave a slot with 0 candidates on a small library even when a perfectly
// usable exercise exists for a different goal.
function rank(
  exercise: Exercise,
  slot: { pattern: MovementPattern; role: ExerciseRole; preferredMuscles: MuscleGroup[]; avoidMuscles: MuscleGroup[] },
  goal: Goal,
  experience: ExperienceLevel,
  weekUsage: Map<string, number>,
  selectedInDay: Exercise[],
): number {
  const preferredHits = exercise.muscles.primary.filter((m) =>
    slot.preferredMuscles.includes(m),
  ).length;
  const avoidHits = exercise.muscles.primary.filter((m) => slot.avoidMuscles.includes(m)).length;
  const goalMatch = exercise.suitableGoals.includes(goal) ? 1 : 0;

  // Primary/secondary slots favor compound movements; accessory slots
  // favor isolation — a coach doesn't typically make a lateral raise the
  // day's main lift, or a heavy compound the fourth accessory exercise.
  // Exercises with no strengthType (core/carry) are neutral either way.
  let roleMatch = 0;
  if (exercise.strengthType === 'compound' && slot.role !== 'accessory') roleMatch = 1;
  else if (exercise.strengthType === 'isolation' && slot.role === 'accessory') roleMatch = 1;

  // Without this, every candidate that passes the equipment/difficulty
  // filters ties on every other term (0 focus hits, same goalMatch, same
  // roleMatch) whenever focus areas are empty or don't apply — and a tie
  // falls back to array order, silently favoring whatever's listed first
  // in the library regardless of the user's experience. That's how an
  // 'experienced' + 'stronger' user could end up with a bodyweight squat
  // as their primary lift over a barbell back squat: nothing in ranking
  // ever preferred the more advanced, more loadable option. Difficulty is
  // still a hard ceiling (findExerciseForSlot's filter), not a target —
  // this only breaks ties among already-eligible candidates, and only for
  // primary/secondary roles: accessory work stays biased toward simpler
  // movements even for advanced users, which matches how accessory
  // exercises are actually programmed.
  const difficultyFit = slot.role === 'accessory' ? 0 : difficultyRank[exercise.difficulty] * 0.5;

  // "Beginner" isn't the same as "bodyweight" — a free-standing bodyweight
  // squat asks more of balance/coordination than a machine-guided leg
  // press or a counterbalanced goblet squat, even though a difficulty
  // label alone can't tell them apart (all three are tagged 'beginner').
  // Scoped to 'new' only: once a user has some training background,
  // stability is no longer the limiting factor, and this must never
  // compete with difficultyFit's preference for more advanced/loadable
  // work at higher experience levels.
  const stabilityFit =
    experience === 'new'
      ? -(demandRank[exercise.demands.technical] + demandRank[exercise.demands.balance]) * 0.2
      : 0;

  // A tie-breaker, not a hard requirement — nudging toward variety when
  // candidates are otherwise close, not a signal strong enough to compete
  // with difficultyFit (an 'experienced'/'stronger' user's second
  // lower-body day should still get barbell back squat over bodyweight
  // squat, not variety for its own sake). Weighted higher specifically
  // when this exercise is what's earning the slot its preferredHits — a
  // focus-area exercise (e.g. "back") that's clearly the best candidate
  // every single day was repeating verbatim across the whole week (same
  // exercise 3x) even though equally-valid same-pattern variations
  // existed; a focus area should read as emphasis on a *muscle*, not a
  // mandate for one specific exercise name.
  const overusePenalty = weekUsage.get(exercise.id) ?? 0;
  const overuseWeight = preferredHits > 0 ? 0.6 : 0.1;

  // FUNCTIONAL OVERLAP / FATIGUE — a preference, not a filter (spec:
  // "do not ban repeated patterns"). Penalizes this candidate for
  // overlapping with exercises ALREADY selected earlier in the same day
  // (any role), weighted enough to outweigh roleMatch's compound
  // preference (1.0) when overlap is high — so, e.g., a second
  // horizontal-pull slot prefers Face Pull (isolation, 0 overlap with an
  // already-picked Barbell Row) over a second bent-over row (compound,
  // same primary muscles, overlap 1.0) — while a low-overlap pair like
  // Romanian Deadlift alongside Hip Thrust (overlap 0.5) is barely
  // discouraged at all, and a different-pattern pair (Squat next to a
  // rear-foot-elevated split squat) isn't discouraged in the first place
  // — functionalOverlap is 0 whenever the pattern or strengthType
  // differs. Takes the WORST (highest) overlap against any one
  // already-selected exercise, not a sum — stacking three unrelated
  // exercises shouldn't accumulate a penalty meant for one clash.
  const overlapPenalty = selectedInDay.reduce(
    (worst, already) => Math.max(worst, functionalOverlap(exercise, already)),
    0,
  );

  return (
    preferredHits -
    avoidHits +
    goalMatch +
    roleMatch +
    difficultyFit +
    stabilityFit -
    overusePenalty * overuseWeight -
    overlapPenalty * 1.5
  );
}
