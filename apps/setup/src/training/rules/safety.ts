// Special physical/medical context handling.
// See training/evidence/safety.md — content here is PROVISIONAL, not reviewed.
//
// Binding constraint (spec §4.1 step 8): until dedicated, reviewed
// programming logic exists for a context, SetUp must not automatically
// generate a specialized plan for it. This file exists so that support can
// be added per-context later without redesigning the onboarding or engine —
// every TrainingContext already has an entry here, just null.

import type { TrainingContext } from '../../domain/onboarding';

// Placeholder shape — to be defined when reviewed programming logic exists
// for a context.
export type ContextRule = Record<string, unknown>;

// PROVISIONAL — not reviewed. All null: no context currently has reviewed
// programming logic.
export const contextRules: Record<TrainingContext, ContextRule | null> = {
  injury: null,
  pregnant: null,
  postpartum: null,
};

// True if any of the given contexts has no reviewed rule yet. The generator
// must call this for visibility but must NEVER branch programming variables
// on its result — see generator/generate-plan.ts and its test asserting
// identical output regardless of context.
export function hasUnsupportedContext(context: TrainingContext[]): boolean {
  return context.some((c) => contextRules[c] === null);
}
