// Stage 3: turn the split's day templates into role-tagged slots.
//
// v2 (2026-08-16): no more "cycle patterns until a duration-derived count
// is reached." Each split's `days` array now has one template per actual
// day of the week (splits.ts), so this stage no longer cycles at all —
// and within a day, the base slot list is exactly primary + secondaryPatterns
// + however many of optionalPatterns the goal calls for.
//
// v3 (2026-08-16): "however many optionalPatterns the goal calls for" now
// has two modes (rules/session-composition.ts's usesRemainingCapacityByGoal):
// most goals still use a fixed accessoryBudget; goals that benefit from
// using real remaining session time (currently just 'muscle') instead walk
// the template's optionalPatterns in duration-budget order — MINIMUM
// SESSION → GOAL-BENEFICIAL ADDITIONS → STOP. Either way, duration and
// experience remain a ceiling that can only *trim*, never pad — a
// session's exercise count is a programming decision, not a function of
// how much clock time happens to be available, even for the goals that
// are allowed to use more of that time when there's genuine coverage
// still missing.

import type { OnboardingAnswers } from '../../domain/onboarding';
import type { MovementPattern } from '../../domain/exercise';
import type { SplitDefinition, SplitDayTemplate } from '../rules/splits';
import type { ExerciseRole } from '../rules/goals';
import type { RoleSets } from './calculate-volume';
import { durationConstraints } from '../rules/duration';
import { experienceRules } from '../rules/experience';
import { accessoryBudgetByGoal, usesRemainingCapacityByGoal } from '../rules/session-composition';
import { estimateSlotSeconds } from './estimate-duration';

export type RoleSlot = {
  pattern: MovementPattern;
  role: ExerciseRole;
};

export type DayMovementPlan = {
  name: string;
  slots: RoleSlot[];
};

export function assignMovementPatterns(
  split: SplitDefinition,
  answers: OnboardingAnswers,
  roleSets: RoleSets,
): DayMovementPlan[] {
  const ceiling = Math.min(
    durationConstraints[answers.sessionDuration].maxExercises,
    experienceRules[answers.experience].maxExercisesPerSession,
  );

  return split.days.map((template) => ({
    name: template.name,
    slots: usesRemainingCapacityByGoal[answers.goal]
      ? buildSlotsUsingRemainingCapacity(template, answers, roleSets, ceiling)
      : buildSlotsWithFixedBudget(template, answers, ceiling),
  }));
}

function buildSlotsWithFixedBudget(
  template: SplitDayTemplate,
  answers: OnboardingAnswers,
  ceiling: number,
): RoleSlot[] {
  const slots = baseSlots(template);
  const accessoryBudget = accessoryBudgetByGoal[answers.goal];

  for (const pattern of template.optionalPatterns.slice(0, accessoryBudget)) {
    slots.push({ pattern, role: 'accessory' });
  }

  // A ceiling, not a target — trims a template that (for a very short
  // duration or a low experience ceiling) genuinely doesn't fit, never
  // adds anything beyond what primary/secondary/accessory-budget already
  // decided.
  return slots.slice(0, ceiling);
}

// MINIMUM SESSION → GOAL-BENEFICIAL ADDITIONS → STOP. Adds one optional
// pattern at a time, in the template's declared priority order, as long
// as the estimated session time still fits the user's duration budget.
// Never pads beyond what the template lists as useful for this day (no
// pattern repeats, no invented content), and the ceiling still applies on
// top — this can use more of a generous duration budget, it can't exceed
// what experience/duration allow.
function buildSlotsUsingRemainingCapacity(
  template: SplitDayTemplate,
  answers: OnboardingAnswers,
  roleSets: RoleSets,
  ceiling: number,
): RoleSlot[] {
  const slots = baseSlots(template);
  const budgetSeconds = answers.sessionDuration * 60;
  let estimatedSeconds = slots.reduce(
    (sum, slot) => sum + estimateSlotSeconds(slot.role, answers.goal, roleSets[slot.role]),
    0,
  );

  for (const pattern of template.optionalPatterns) {
    if (slots.length >= ceiling) break;
    const additionalSeconds = estimateSlotSeconds('accessory', answers.goal, roleSets.accessory);
    if (estimatedSeconds + additionalSeconds > budgetSeconds) break;
    slots.push({ pattern, role: 'accessory' });
    estimatedSeconds += additionalSeconds;
  }

  return slots.slice(0, ceiling);
}

function baseSlots(template: SplitDayTemplate): RoleSlot[] {
  const slots: RoleSlot[] = [{ pattern: template.primaryPattern, role: 'primary' }];
  for (const pattern of template.secondaryPatterns) {
    slots.push({ pattern, role: 'secondary' });
  }
  return slots;
}
