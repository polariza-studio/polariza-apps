// Stage: composes a warm-up and a cool-down for a day from its ACTUAL
// final (post-quality-pass) exercises, not from the day's label — see
// rules/warmup-cooldown.ts. Runs AFTER the main workout is fully
// selected and quality-checked, analyzing its movement patterns, then
// greedy-fills a priority-ordered candidate list against a duration
// budget. Pure and deterministic: same exercises + same equipment always
// produce the same warm-up/cool-down.

import type { Exercise, MovementPattern } from '../../domain/exercise';
import type { Equipment } from '../../domain/onboarding';
import type { WarmupCooldownExercise } from '../../domain/plan';
import {
  bucketsForPatterns,
  targetWarmupCooldownMinutes,
  warmupCandidates,
  cooldownCandidates,
  type WarmupCooldownCandidate,
  type SelectionContext,
} from '../rules/warmup-cooldown';
import { estimateWarmupCooldownSeconds } from './estimate-duration';

export function selectWarmupCooldown(
  dayPatterns: MovementPattern[],
  sessionDurationMinutes: number,
  exerciseLibrary: Exercise[],
  availableEquipment: Equipment[],
): { warmup: WarmupCooldownExercise[]; cooldown: WarmupCooldownExercise[] } {
  const byId = new Map(exerciseLibrary.map((exercise) => [exercise.id, exercise]));
  const context: SelectionContext = {
    buckets: bucketsForPatterns(dayPatterns),
    patterns: new Set(dayPatterns),
  };
  const targetSeconds = targetWarmupCooldownMinutes(sessionDurationMinutes) * 60;

  return {
    warmup: greedyFill(warmupCandidates, context, byId, availableEquipment, targetSeconds),
    cooldown: greedyFill(cooldownCandidates, context, byId, availableEquipment, targetSeconds),
  };
}

const MAX_BLOCK_SECONDS = 5 * 60;

function greedyFill(
  candidates: WarmupCooldownCandidate[],
  context: SelectionContext,
  byId: Map<string, Exercise>,
  availableEquipment: Equipment[],
  targetSeconds: number,
): WarmupCooldownExercise[] {
  const selected: WarmupCooldownExercise[] = [];

  for (const candidate of candidates) {
    if (!candidate.appliesTo(context)) continue;
    const exercise = byId.get(candidate.exerciseId);
    if (!exercise) continue;
    if (!exercise.equipment.every((eq) => availableEquipment.includes(eq))) continue;

    const tentative = [...selected, { exerciseId: exercise.id, prescription: candidate.prescription }];
    const tentativeSeconds = estimateWarmupCooldownSeconds(tentative);
    if (tentativeSeconds > MAX_BLOCK_SECONDS) continue;

    selected.push({ exerciseId: exercise.id, prescription: candidate.prescription });
    if (tentativeSeconds >= targetSeconds) break;
  }

  return selected;
}
