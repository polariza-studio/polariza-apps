// Equipment compatibility.
// See training/evidence/*.md — content here is PROVISIONAL, not reviewed.

import type { Equipment, TrainingEnvironment } from '../../domain/onboarding';

// PROVISIONAL — not reviewed, placeholder only. Which specific equipment
// counts as "standard gym equipment" is a judgment call, not hard science.
export const standardGymEquipment: Equipment[] = [
  'dumbbells',
  'barbell',
  'bench',
  'pull-up-bar',
];

// Resolves the equipment actually available to the user. Per spec §4.1
// step 5, a gym user is assumed to have standard gym equipment regardless
// of the (empty) equipment array in their onboarding answers — that array
// is only meaningful for trainingEnvironment: 'home'.
//
// 'bodyweight-only' is always included: needing no equipment is never
// blocked by which equipment the user does or doesn't have access to,
// so bodyweight exercises must stay selectable in every environment.
export function resolveAvailableEquipment(
  trainingEnvironment: TrainingEnvironment,
  equipment: Equipment[],
): Equipment[] {
  const base = trainingEnvironment === 'gym' ? standardGymEquipment : equipment;
  return base.includes('bodyweight-only') ? base : [...base, 'bodyweight-only'];
}
