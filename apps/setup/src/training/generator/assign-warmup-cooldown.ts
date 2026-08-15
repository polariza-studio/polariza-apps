// Stage: assigns exactly one warm-up and one cool-down exercise to a day,
// based on that day's body area (rules/warmup-cooldown.ts). Kept as its
// own stage rather than folded into assign-movement-patterns.ts/
// select-exercises.ts — warm-up/cool-down selection is ID-lookup + a
// fixed prescription, not pattern-slot ranking, so reusing that machinery
// would add complexity these two exercises don't need.

import type { Exercise } from '../../domain/exercise';
import type { Equipment } from '../../domain/onboarding';
import type { ExercisePrescription, WarmupCooldownExercise } from '../../domain/plan';
import type { SplitId } from '../rules/splits';
import type { MovementPattern } from '../../domain/exercise';
import {
  bodyAreaForDay,
  WARMUP_EXERCISE_ID,
  COOLDOWN_EXERCISE_ID,
  warmupPrescriptionRules,
  cooldownPrescriptionRules,
  type WarmupCooldownPrescriptionRules,
} from '../rules/warmup-cooldown';

export function assignWarmupCooldown(
  primaryPattern: MovementPattern,
  splitId: SplitId,
  exerciseLibrary: Exercise[],
  availableEquipment: Equipment[],
): { warmup: WarmupCooldownExercise[]; cooldown: WarmupCooldownExercise[] } {
  const byId = new Map(exerciseLibrary.map((exercise) => [exercise.id, exercise]));
  const area = bodyAreaForDay(primaryPattern, splitId);

  return {
    warmup: buildEntry(byId.get(WARMUP_EXERCISE_ID[area]), warmupPrescriptionRules, availableEquipment),
    cooldown: buildEntry(byId.get(COOLDOWN_EXERCISE_ID[area]), cooldownPrescriptionRules, availableEquipment),
  };
}

// Every current warmup/cooldown library exercise is bodyweight-only, so
// this should always succeed — but if the library ever adds an
// equipment-gated one, dropping the slot (rather than assigning
// something the user can't actually do) is the safe failure mode.
function buildEntry(
  exercise: Exercise | undefined,
  rules: WarmupCooldownPrescriptionRules,
  availableEquipment: Equipment[],
): WarmupCooldownExercise[] {
  if (!exercise) return [];
  if (!exercise.equipment.every((eq) => availableEquipment.includes(eq))) return [];

  return [{ exerciseId: exercise.id, prescription: buildPrescription(exercise, rules) }];
}

function buildPrescription(exercise: Exercise, rules: WarmupCooldownPrescriptionRules): ExercisePrescription {
  const mode = exercise.trackingMode;
  if (mode === 'duration' || mode === 'duration-side') {
    return { mode, sets: rules.sets, durationSeconds: rules.durationSeconds, restSeconds: rules.restSeconds };
  }
  // Every current warmup/cooldown library exercise is duration-tracked
  // (a hold or a flow, never a weighted/rep-counted lift) — this is a
  // defensive guard against a future library entry using an
  // incompatible trackingMode, not a case that happens today.
  throw new Error(`Warm-up/cool-down exercise "${exercise.id}" has unsupported trackingMode "${mode}".`);
}
