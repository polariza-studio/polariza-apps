// One-time compatibility migration for users who onboarded before the
// trainingHistory/currentStrengthTrainingFrequency redesign (2026-08-19)
// — their persisted preferences blob has the old `experience` field and
// no `trainingHistory` at all. This is MIGRATION COMPATIBILITY ONLY, not
// new training logic: the mapping below is the literal legacy self-report
// translated to its closest observable-duration equivalent, per explicit
// product decision —
//
//   legacy 'new'             -> trainingHistory 'just-starting'
//   legacy 'some-experience' -> trainingHistory 'six-to-eighteen-months'
//   legacy 'experienced'     -> trainingHistory 'more-than-18-months'
//
// currentStrengthTrainingFrequency is NEVER fabricated from this — there
// is no legacy answer to translate, so it's left exactly as it was
// (absent, for a genuine legacy record). The generator treats a missing
// currentStrengthTrainingFrequency as neutral (see
// training/rules/workload-readiness.ts, training/rules/starting-load.ts)
// — never a guess, never a conservative default that would materially
// downgrade an existing active user.
//
// Applied once, at the storage read boundary
// (local-storage-repository.ts's getPreferences) — self-heals by writing
// the migrated record back immediately, so this never re-runs for the
// same user twice.

import type { OnboardingAnswers, TrainingHistory } from '../../domain/onboarding';

type LegacyExperience = 'new' | 'some-experience' | 'experienced';

const legacyExperienceToTrainingHistory: Record<LegacyExperience, TrainingHistory> = {
  new: 'just-starting',
  'some-experience': 'six-to-eighteen-months',
  experienced: 'more-than-18-months',
};

function isLegacyExperience(value: unknown): value is LegacyExperience {
  return value === 'new' || value === 'some-experience' || value === 'experienced';
}

// `raw` is whatever JSON.parse produced from storage — may predate
// trainingHistory entirely. Returns null when the input isn't a
// recognizable preferences shape at all (same "nothing usable" outcome
// as no preferences existing). Never mutates `raw`.
export function migrateLegacyPreferences(raw: unknown): OnboardingAnswers | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const record = raw as Record<string, unknown>;

  if (typeof record.trainingHistory === 'string') {
    // Already modern shape — nothing to migrate.
    return record as OnboardingAnswers;
  }

  if (!isLegacyExperience(record.experience)) return null;

  const { experience, ...rest } = record;
  return {
    ...(rest as OnboardingAnswers),
    trainingHistory: legacyExperienceToTrainingHistory[experience],
  };
}
