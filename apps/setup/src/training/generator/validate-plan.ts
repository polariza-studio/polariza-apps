// Stage 8: plan validation, in two tiers.
//
// `errors` are hard rejects — generate-plan.ts throws rather than return a
// plan with any of these, because they mean the plan is structurally
// broken or unsafe to hand to a user (unknown exercise, equipment the user
// doesn't have, a required movement pattern missing entirely, a session
// that can't fit in the time available).
//
// `warnings` are soft flags — real programming-quality signals (weekly
// volume outside a reasonable range, an overused high-fatigue exercise, a
// day not ordered main-lift-first) that are worth surfacing for review but
// don't mean the plan is broken enough to refuse to generate. Nothing
// currently reads `warnings` in production; they exist for tests and for
// the human-reviewable fixture plans to surface.
//
// STANDING CONSTRAINT — the weekly-volume warnings specifically
// (validateWeeklyVolume below) are known to be coarse (see
// rules/volume.ts's technical-debt note: goal-uniform ranges, no
// per-muscle-group accounting for compound-lift crossover). They must
// stay soft-only: nothing in the generator pipeline may branch on them,
// retry a slot, adjust prescribed sets, or otherwise auto-correct a plan
// based on this heuristic. If that ever needs to change, it's a
// deliberate decision to make after the heuristic itself is reviewed —
// not a side effect of some other change.

import type { Exercise, MuscleGroup } from '../../domain/exercise';
import type { Equipment } from '../../domain/onboarding';
import type { PlannedExercise, TrainingPlan, WarmupCooldownExercise } from '../../domain/plan';
import type { SplitDefinition } from '../rules/splits';
import { complexityRules } from '../rules/exercise-complexity';
import { resolveAvailableEquipment } from '../rules/equipment';
import { weeklyVolumeTargets } from '../rules/volume';
import { focusAreaMuscles } from '../rules/priorities';
import { maxHighSystemicPerSession } from '../rules/session-composition';

export type ValidationResult = {
  errors: string[];
  warnings: string[];
};

const difficultyRank: Record<Exercise['difficulty'], number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

const roleRank: Record<PlannedExercise['role'], number> = {
  primary: 0,
  secondary: 1,
  accessory: 2,
};

// A session running more than this far over the planning-constraint
// duration is treated as not actually fitting the user's time budget.
const DURATION_TOLERANCE = 0.15;

// A single muscle group taking more than this share of total weekly sets
// suggests the plan has tipped from "focus emphasis" into "unbalanced".
const MAX_MUSCLE_SHARE_OF_WEEKLY_VOLUME = 0.4;

export function validatePlan(
  plan: TrainingPlan,
  exerciseLibrary: Exercise[],
  split: SplitDefinition,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const byId = new Map(exerciseLibrary.map((exercise) => [exercise.id, exercise]));
  const availableEquipment = resolveAvailableEquipment(
    plan.preferences.trainingEnvironment,
    plan.preferences.equipment,
  );
  const maxDifficultyRank = difficultyRank[complexityRules[plan.preferences.trainingHistory].maxDifficulty];

  if (plan.days.length === 0) {
    errors.push('Plan has no training days.');
  }

  for (const [dayIndex, day] of plan.days.entries()) {
    const label = (exerciseId: string) => `Exercise "${exerciseId}" in day "${day.name}"`;

    if (day.exercises.length === 0) {
      errors.push(`Day "${day.name}" (${day.id}) has no exercises.`);
    }

    let highSystemicCount = 0;
    let lastRoleRank = -1;
    let orderingBroken = false;

    for (const plannedExercise of day.exercises) {
      const exercise = byId.get(plannedExercise.exerciseId);

      if (!exercise) {
        errors.push(`${label(plannedExercise.exerciseId)} references an unknown exercise ID.`);
        continue;
      }

      if (plannedExercise.prescription.sets <= 0) {
        errors.push(`${label(exercise.id)} has non-positive sets (${plannedExercise.prescription.sets}).`);
      }

      if ('repRange' in plannedExercise.prescription) {
        const [min, max] = plannedExercise.prescription.repRange;
        if (min <= 0 || min > max) {
          errors.push(`${label(exercise.id)} has an invalid repRange (${min}-${max}).`);
        }
      } else if (plannedExercise.prescription.durationSeconds <= 0) {
        errors.push(`${label(exercise.id)} has non-positive durationSeconds.`);
      }

      if ((plannedExercise.prescription.restSeconds ?? 0) < 0) {
        errors.push(`${label(exercise.id)} has negative restSeconds.`);
      }

      if (difficultyRank[exercise.difficulty] > maxDifficultyRank) {
        errors.push(`${label(exercise.id)} exceeds the user's training-history complexity ceiling (${exercise.difficulty}).`);
      }

      if (!exercise.equipment.every((eq) => availableEquipment.includes(eq))) {
        errors.push(`${label(exercise.id)} requires equipment the user doesn't have.`);
      }

      if (exercise.demands.systemic === 'high') highSystemicCount++;

      const thisRoleRank = roleRank[plannedExercise.role];
      if (thisRoleRank < lastRoleRank) orderingBroken = true;
      lastRoleRank = thisRoleRank;
    }

    if (highSystemicCount > maxHighSystemicPerSession) {
      warnings.push(
        `Day "${day.name}" stacks ${highSystemicCount} high-fatigue exercises in one session (max recommended ${maxHighSystemicPerSession}) — likely a deliberate advanced multi-primary-lift day, since session-quality-pass.ts already trims accessory-tier stacking before this.`,
      );
    }

    if (orderingBroken) {
      warnings.push(`Day "${day.name}" isn't ordered primary → secondary → accessory.`);
    }

    const sessionDuration = plan.preferences.sessionDuration;
    if (day.estimatedDurationMinutes > sessionDuration * (1 + DURATION_TOLERANCE)) {
      errors.push(
        `Day "${day.name}" is estimated at ${day.estimatedDurationMinutes} min, exceeding the ${sessionDuration} min session-duration constraint.`,
      );
    }

    validateWarmupCooldown(day.warmup, 'warm-up', day.name, byId, availableEquipment, errors);
    validateWarmupCooldown(day.cooldown, 'cool-down', day.name, byId, availableEquipment, errors);

    const template = split.days[dayIndex % split.days.length];
    const coveredPatterns = new Set(
      day.exercises
        .map((e) => byId.get(e.exerciseId)?.movementPattern)
        .filter((p): p is NonNullable<typeof p> => p !== undefined),
    );
    const requiredPatterns = [template.primaryPattern, ...template.secondaryPatterns];
    for (const requiredPattern of requiredPatterns) {
      if (!coveredPatterns.has(requiredPattern)) {
        errors.push(`Day "${day.name}" is missing its required "${requiredPattern}" movement pattern.`);
      }
    }
  }

  if (errors.length === 0) {
    warnings.push(...validateWeeklyVolume(plan, byId));
  }

  return { errors, warnings };
}

// MVP is always exactly one warm-up and one cool-down exercise
// (rules/warmup-cooldown.ts) — a day with zero means selection found no
// equipment-compatible candidate, which shouldn't happen given the
// library's warm-up/cool-down content is entirely bodyweight-only, but
// is treated as a hard error rather than silently shipping a workout
// with no warm-up if a future library change ever breaks that guarantee.
function validateWarmupCooldown(
  entries: WarmupCooldownExercise[],
  label: 'warm-up' | 'cool-down',
  dayName: string,
  byId: Map<string, Exercise>,
  availableEquipment: Equipment[],
  errors: string[],
): void {
  if (entries.length === 0) {
    errors.push(`Day "${dayName}" has no ${label} exercise.`);
    return;
  }

  for (const entry of entries) {
    const exercise = byId.get(entry.exerciseId);
    if (!exercise) {
      errors.push(`${label} exercise "${entry.exerciseId}" in day "${dayName}" references an unknown exercise ID.`);
      continue;
    }
    if (!exercise.equipment.every((eq) => availableEquipment.includes(eq))) {
      errors.push(`${label} exercise "${exercise.id}" in day "${dayName}" requires equipment the user doesn't have.`);
    }
    if (entry.prescription.sets <= 0) {
      errors.push(`${label} exercise "${exercise.id}" in day "${dayName}" has non-positive sets.`);
    }
  }
}

function validateWeeklyVolume(plan: TrainingPlan, byId: Map<string, Exercise>): string[] {
  const warnings: string[] = [];
  const volumeByMuscle = new Map<MuscleGroup, number>();

  for (const day of plan.days) {
    for (const plannedExercise of day.exercises) {
      const exercise = byId.get(plannedExercise.exerciseId);
      if (!exercise) continue;
      for (const muscle of exercise.muscles.primary) {
        volumeByMuscle.set(muscle, (volumeByMuscle.get(muscle) ?? 0) + plannedExercise.prescription.sets);
      }
    }
  }

  const [minTarget, maxTarget] = weeklyVolumeTargets[plan.preferences.goal];
  const totalVolume = [...volumeByMuscle.values()].reduce((sum, v) => sum + v, 0);

  for (const [muscle, sets] of volumeByMuscle) {
    if (sets < minTarget) {
      warnings.push(`Weekly volume for ${muscle} (${sets} sets) is below the target range (${minTarget}-${maxTarget}).`);
    } else if (sets > maxTarget) {
      warnings.push(`Weekly volume for ${muscle} (${sets} sets) exceeds the target range (${minTarget}-${maxTarget}).`);
    }

    if (totalVolume > 0 && sets / totalVolume > MAX_MUSCLE_SHARE_OF_WEEKLY_VOLUME) {
      warnings.push(`${muscle} takes up more than ${Math.round(MAX_MUSCLE_SHARE_OF_WEEKLY_VOLUME * 100)}% of total weekly volume — plan may be unbalanced.`);
    }
  }

  // Simplification, not a full "still needed" check: flags a deprioritized
  // area at exactly zero weekly volume for manual review, since spec §4.1
  // step 7 requires deprioritizing to never remove necessary training —
  // determining whether zero was actually *necessary* here would require
  // comparing against a hypothetical non-deprioritized plan.
  for (const area of plan.preferences.deprioritizedAreas) {
    const musclesForArea = focusAreaMuscles[area];
    const totalForArea = musclesForArea.reduce((sum, m) => sum + (volumeByMuscle.get(m) ?? 0), 0);
    if (totalForArea === 0) {
      warnings.push(`Deprioritized area "${area}" has zero weekly volume — verify this isn't removing necessary training.`);
    }
  }

  return warnings;
}
