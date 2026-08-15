// The approved exercise library. Every exercise the generator assigns must
// come from here — spec §4.2: "The generator must not invent exercises
// that do not exist in the SetUp exercise library."
//
// v1 MVP library (2026-08-15): ~48 exercises, built together with the
// generator so plan quality could be validated against real coverage
// rather than a token set. Spans every MuscleGroup and every equipment
// tier (bodyweight, dumbbells, barbell, resistance bands, bench,
// pull-up bar, cable, machine), at beginner through advanced difficulty.
// Every split's `requiredPatterns` (training/rules/splits.ts) has at
// least one bodyweight-only, beginner-difficulty candidate — see that
// file's comment for why that guarantee matters.
//
// Extended 2026-08-16 (58 exercises) against a hand-authored quality
// benchmark (generator/__fixtures__/golden-quality-benchmark.md): added
// dumbbell-reverse-lunge, dumbbell-step-up, cable-face-pull,
// cable-pallof-press, machine-hip-abduction, barbell-rdl — each a normal,
// fully fleshed-out selectable exercise (not a one-off matched only to
// the benchmark's exact names). dead-bug's trackingMode was reclassified
// 'reps' → 'reps-side' at the same time — see its own comment.
//
// The movements and technique cues follow widely-established coaching
// consensus for these specific exercises (not contested programming
// science like training/rules/*.ts), but have not been reviewed by a
// certified professional — treat this as a functional starting point, not
// final authoritative guidance. startingLoad is deliberately unset here
// for every exercise as of 2026-08-16 — the schema shipped ahead of the
// curated numbers, which are pending review (see the per-exercise
// starting-load table under review). imagePath is intentionally unset
// everywhere — no image assets exist yet.

import type { Exercise } from '../../domain/exercise';

export const exerciseLibrary: Exercise[] = [
  // ============================================================
  // SQUAT
  // ============================================================
  {
    id: 'bodyweight-squat',
    name: 'Bodyweight squat',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'squat',
    muscles: { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings'] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    // balance: 'medium', not 'low' — free-standing with no counterbalance
    // or fixed path, unlike a machine-guided or counterbalanced variant of
    // the same pattern (see leg-press, goblet-squat). Difficulty alone
    // doesn't capture this: all three are 'beginner', but they don't ask
    // the same thing of a true beginner in a gym with better options
    // available — see select-exercises.ts's stabilityFit.
    demands: { technical: 'low', balance: 'medium', mobility: 'medium', systemic: 'low' },
    technique: {
      description: 'A no-equipment squat pattern, foundational for lower-body strength.',
      setup: ['Stand with feet shoulder-width apart, toes slightly turned out.'],
      execution: [
        'Sit the hips back and down, keeping the chest up and knees tracking over the toes.',
        'Descend until thighs are roughly parallel to the floor, then drive through the whole foot to stand.',
      ],
      cues: ['Push the floor away.', 'Keep the chest tall.'],
      commonMistakes: ['Letting the knees cave inward.', 'Lifting the heels off the floor.'],
    },
    trackingMode: 'reps',
  },
  {
    id: 'goblet-squat',
    name: 'Goblet squat',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'squat',
    muscles: { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings', 'core'] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'medium', systemic: 'medium' },
    technique: {
      description: 'A dumbbell-loaded squat that reinforces upright posture.',
      setup: ['Hold one dumbbell vertically at chest height with both hands.'],
      execution: [
        'Squat down between the knees, keeping the dumbbell close to the chest.',
        'Drive through the feet to return to standing.',
      ],
      cues: ['Elbows point down, not out.', 'Keep the dumbbell close to the body.'],
      commonMistakes: ['Rounding the lower back at the bottom.', 'Letting the dumbbell drift forward.'],
    },
    trackingMode: 'reps-weight',
  },
  {
    id: 'barbell-back-squat',
    name: 'Barbell back squat',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'squat',
    muscles: { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings', 'core'] },
    equipment: ['barbell'],
    difficulty: 'intermediate',
    suitableGoals: ['stronger', 'muscle', 'athletic'],
    demands: { technical: 'high', balance: 'medium', mobility: 'high', systemic: 'high' },
    technique: {
      description: 'The primary barbell lift for lower-body strength and mass.',
      setup: ['Rack the bar across the upper back (high-bar or low-bar), feet shoulder-width.'],
      execution: [
        'Brace the core, sit the hips back and down under control.',
        'Descend to at least parallel, then drive up through the mid-foot.',
      ],
      cues: ['Brace before you break.', 'Spread the floor with your feet.'],
      commonMistakes: ['Losing core brace at the bottom.', 'Knees collapsing inward under load.'],
    },
    trackingMode: 'reps-weight',
  },
  {
    id: 'leg-press',
    name: 'Leg press',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'squat',
    muscles: { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings'] },
    equipment: ['machine'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'medium' },
    technique: {
      description: 'A machine-guided squat pattern with no balance demand.',
      setup: ['Sit in the machine, feet shoulder-width on the platform.'],
      execution: [
        'Lower the platform under control until knees reach roughly 90 degrees.',
        'Press through the whole foot back to the start without locking the knees hard.',
      ],
      cues: ['Feet flat, weight through the mid-foot.', 'Control the negative.'],
      commonMistakes: ['Letting the lower back round off the pad.', 'Locking the knees out aggressively at the top.'],
    },
    trackingMode: 'reps-weight',
  },

  // ============================================================
  // HINGE
  // ============================================================
  {
    id: 'glute-bridge',
    name: 'Glute bridge',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'hinge',
    muscles: { primary: ['glutes', 'hamstrings'], secondary: ['core'] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A no-equipment hip-hinge that teaches glute-driven extension.',
      setup: ['Lie on the back, knees bent, feet flat close to the glutes.'],
      execution: ['Drive through the heels to lift the hips until the body forms a straight line.', 'Lower under control.'],
      cues: ['Squeeze the glutes at the top.', 'Drive through the heels.'],
      commonMistakes: ['Overarching the lower back at the top.', 'Pushing through the toes instead of the heels.'],
    },
    trackingMode: 'reps',
  },
  {
    id: 'dumbbell-rdl',
    name: 'Dumbbell Romanian deadlift',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'hinge',
    muscles: { primary: ['hamstrings', 'glutes'], secondary: ['back'] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'medium', balance: 'low', mobility: 'medium', systemic: 'medium' },
    technique: {
      description: 'A hip-hinge that loads the hamstrings and glutes through a stretch.',
      setup: ['Hold a dumbbell in each hand in front of the thighs.'],
      execution: [
        'Push the hips back while keeping a soft knee bend, lowering the dumbbells along the legs.',
        'Feel a stretch in the hamstrings, then drive the hips forward to stand.',
      ],
      cues: ['Push the hips back, not down.', 'Keep the bar/dumbbells close to the legs.'],
      commonMistakes: ['Rounding the lower back.', 'Bending the knees too much, turning it into a squat.'],
    },
    trackingMode: 'reps-weight',
  },
  {
    id: 'barbell-rdl',
    name: 'Barbell Romanian deadlift',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'hinge',
    muscles: { primary: ['hamstrings', 'glutes'], secondary: ['back'] },
    equipment: ['barbell'],
    difficulty: 'intermediate',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    // One tier up from dumbbell-rdl (same pattern, same primary muscles)
    // for the same reason barbell-bench-press sits above dumbbell-bench-
    // press and barbell-row sits above dumbbell-row throughout this file:
    // a bar path and heavier loading raise the technical/systemic cost
    // over the dumbbell version, even though the movement itself is the
    // same hip-hinge. Kept as a genuinely separate exercise, not a
    // replacement — see this exercise's id vs 'dumbbell-rdl'.
    demands: { technical: 'medium', balance: 'low', mobility: 'medium', systemic: 'medium' },
    technique: {
      description: 'A barbell hip-hinge that loads the hamstrings and glutes through a stretch, with more external load than the dumbbell version.',
      setup: ['Hold the bar at hip height with a shoulder-width grip.'],
      execution: [
        'Push the hips back while keeping a soft knee bend, lowering the bar along the legs.',
        'Feel a stretch in the hamstrings, then drive the hips forward to stand.',
      ],
      cues: ['Push the hips back, not down.', 'Keep the bar close to the legs throughout.'],
      commonMistakes: ['Rounding the lower back.', 'Bending the knees too much, turning it into a squat.'],
    },
    trackingMode: 'reps-weight',
  },
  {
    id: 'barbell-deadlift',
    name: 'Barbell deadlift',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'hinge',
    muscles: { primary: ['hamstrings', 'glutes', 'back'], secondary: ['core'] },
    equipment: ['barbell'],
    difficulty: 'advanced',
    suitableGoals: ['stronger', 'muscle', 'athletic'],
    demands: { technical: 'high', balance: 'medium', mobility: 'high', systemic: 'high' },
    technique: {
      description: 'A full hip-hinge pull from the floor — one of the highest-value strength lifts.',
      setup: ['Bar over mid-foot, grip just outside the legs, hips set higher than the knees.'],
      execution: [
        'Brace hard, take the slack out of the bar, then drive the floor away while keeping the bar close to the shins.',
        'Lock out by extending the hips, not by leaning back excessively.',
      ],
      cues: ['Pull the slack out first.', 'Push the floor away.'],
      commonMistakes: ['Rounding the lower back off the floor.', 'Letting the bar drift away from the shins.'],
    },
    trackingMode: 'reps-weight',
  },
  {
    id: 'hip-thrust',
    name: 'Barbell hip thrust',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'hinge',
    muscles: { primary: ['glutes'], secondary: ['hamstrings'] },
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'medium', balance: 'low', mobility: 'low', systemic: 'medium' },
    technique: {
      description: 'The most direct glute-loading exercise available.',
      setup: ['Upper back against a bench, barbell over the hips, feet flat.'],
      execution: ['Drive through the heels to extend the hips fully.', 'Lower under control without resting the weight on the floor between reps.'],
      cues: ['Chin tucked, ribs down.', 'Squeeze the glutes hard at the top.'],
      commonMistakes: ['Hyperextending the lower back at the top.', 'Pushing through the toes.'],
    },
    trackingMode: 'reps-weight',
  },

  // ============================================================
  // LUNGE
  // ============================================================
  {
    id: 'bodyweight-lunge',
    name: 'Bodyweight lunge',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'lunge',
    muscles: { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings'] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'medium', balance: 'medium', mobility: 'medium', systemic: 'low' },
    technique: {
      description: 'A single-leg pattern that also trains balance.',
      setup: ['Stand tall, feet hip-width.'],
      execution: ['Step forward and lower until both knees reach roughly 90 degrees.', 'Push back to the starting position.'],
      cues: ['Keep the torso upright.', 'Front knee tracks over the foot.'],
      commonMistakes: ['Letting the front knee cave inward.', 'Taking too short a step, overloading the knee.'],
    },
    trackingMode: 'reps-side',
  },
  {
    id: 'dumbbell-reverse-lunge',
    name: 'Dumbbell reverse lunge',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'lunge',
    muscles: { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings'] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    // balance: 'medium', not 'high' — stepping BACK into the lunge and
    // returning to a stable two-foot base each rep is more forgiving than
    // a continuous walking lunge or a rear-foot-elevated split squat
    // (both never return to a stable base mid-set), even though all three
    // share the 'lunge' pattern.
    demands: { technical: 'low', balance: 'medium', mobility: 'medium', systemic: 'low' },
    technique: {
      description: 'A loaded single-leg pattern that steps backward, easier to balance than a walking or forward lunge.',
      setup: ['Stand tall, a dumbbell in each hand at the sides.'],
      execution: ['Step one foot back and lower until both knees reach roughly 90 degrees.', 'Push through the front foot to return to standing.'],
      cues: ['Keep the torso upright.', 'Front knee tracks over the foot.'],
      commonMistakes: ['Letting the front knee cave inward.', 'Stepping back too short a distance.'],
    },
    trackingMode: 'reps-weight-side',
  },
  {
    id: 'dumbbell-walking-lunge',
    name: 'Dumbbell walking lunge',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'lunge',
    muscles: { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings', 'core'] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'medium', balance: 'medium', mobility: 'medium', systemic: 'medium' },
    technique: {
      description: 'A loaded, moving single-leg pattern for strength and coordination.',
      setup: ['Hold a dumbbell in each hand at the sides.'],
      execution: ['Step forward into a lunge, then bring the back foot through into the next step.', 'Keep the torso upright throughout.'],
      cues: ['Tall chest.', 'Control the descent each step.'],
      commonMistakes: ['Rushing the steps and losing balance.', 'Leaning forward from the hips.'],
    },
    trackingMode: 'reps-weight-side',
  },
  {
    id: 'dumbbell-split-squat',
    name: 'Rear-foot-elevated split squat',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'lunge',
    muscles: { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings'] },
    equipment: ['dumbbells', 'bench'],
    difficulty: 'intermediate',
    suitableGoals: ['stronger', 'muscle', 'athletic'],
    demands: { technical: 'high', balance: 'high', mobility: 'high', systemic: 'medium' },
    technique: {
      description: 'A single-leg squat variant with the rear foot elevated for a deeper stretch and load.',
      setup: ['Rear foot up on a bench behind you, a dumbbell in each hand at your sides, front foot far enough forward for a vertical shin at the bottom.'],
      execution: ['Lower straight down until the rear knee nearly touches the floor.', 'Drive through the front foot to stand.'],
      cues: ['Front shin vertical.', 'Most of the weight through the front foot.'],
      commonMistakes: ['Front foot too close, driving the knee far past the toes.', 'Losing balance sideways.'],
    },
    trackingMode: 'reps-weight-side',
  },
  {
    id: 'dumbbell-step-up',
    name: 'Dumbbell step-up',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'lunge',
    muscles: { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings'] },
    equipment: ['dumbbells', 'bench'],
    difficulty: 'intermediate',
    suitableGoals: ['stronger', 'muscle', 'athletic'],
    demands: { technical: 'medium', balance: 'high', mobility: 'medium', systemic: 'medium' },
    technique: {
      description: 'A single-leg pattern that drives up onto an elevated platform — real-world leg strength and stability.',
      setup: ['Stand facing a sturdy bench or box, a dumbbell in each hand at the sides.'],
      execution: ['Drive through the lead foot to step fully onto the platform, avoiding a push off the trailing leg.', 'Step back down under control and repeat.'],
      cues: ['Drive through the whole lead foot.', 'Stand fully tall at the top before stepping down.'],
      commonMistakes: ['Pushing off the back leg to help the rep.', 'Using a platform too high to control.'],
    },
    trackingMode: 'reps-weight-side',
  },

  // ============================================================
  // HORIZONTAL PUSH
  // ============================================================
  {
    id: 'push-up',
    name: 'Push-up',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'horizontal-push',
    muscles: { primary: ['chest', 'triceps'], secondary: ['shoulders', 'core'] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    // balance: 'medium' — a free-standing plank position under load asks
    // for real core/shoulder stability that a machine or bench press
    // doesn't; see bodyweight-squat's comment for why this differs from
    // the difficulty label.
    demands: { technical: 'low', balance: 'medium', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'The classic no-equipment horizontal press.',
      setup: ['Hands slightly wider than shoulders, body in a straight line.'],
      execution: ['Lower the chest to just above the floor, elbows at roughly 45 degrees.', 'Press back up without letting the hips sag.'],
      cues: ['Whole body tight, like a plank.', 'Elbows at 45 degrees, not flared to 90.'],
      commonMistakes: ['Letting the hips sag.', 'Flaring the elbows straight out to the sides.'],
    },
    trackingMode: 'reps',
  },
  {
    id: 'dumbbell-bench-press',
    name: 'Dumbbell bench press',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'horizontal-push',
    muscles: { primary: ['chest', 'triceps'], secondary: ['shoulders'] },
    equipment: ['dumbbells', 'bench'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'medium', mobility: 'medium', systemic: 'medium' },
    technique: {
      description: 'A dumbbell horizontal press with a slightly larger range of motion than barbell.',
      setup: ['Lie on a bench, a dumbbell in each hand at chest level.'],
      execution: ['Press the dumbbells up until the arms are extended over the chest.', 'Lower under control back to chest level.'],
      cues: ['Feet planted, slight arch.', 'Drive the dumbbells up and slightly in.'],
      commonMistakes: ['Flaring the elbows to a full 90 degrees.', 'Bouncing the dumbbells at the bottom.'],
    },
    trackingMode: 'reps-weight',
  },
  {
    id: 'barbell-bench-press',
    name: 'Barbell bench press',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'horizontal-push',
    muscles: { primary: ['chest', 'triceps'], secondary: ['shoulders'] },
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
    suitableGoals: ['stronger', 'muscle', 'athletic'],
    demands: { technical: 'medium', balance: 'low', mobility: 'medium', systemic: 'high' },
    technique: {
      description: 'The primary barbell horizontal press.',
      setup: ['Lie on the bench, eyes under the bar, feet flat on the floor.'],
      execution: ['Lower the bar to the mid-chest under control.', 'Press back up to full elbow extension.'],
      cues: ['Shoulder blades pulled together and down.', 'Drive the feet into the floor.'],
      commonMistakes: ['Bouncing the bar off the chest.', 'Flaring the elbows straight out.'],
    },
    trackingMode: 'reps-weight',
  },
  {
    id: 'machine-chest-press',
    name: 'Machine chest press',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'horizontal-push',
    muscles: { primary: ['chest', 'triceps'], secondary: ['shoulders'] },
    equipment: ['machine'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'medium' },
    technique: {
      description: 'A guided horizontal press, useful for learning press mechanics without balance demand.',
      setup: ['Sit with the handles at chest height, back flat against the pad.'],
      execution: ['Press the handles forward until the arms are extended.', 'Return under control to the starting position.'],
      cues: ['Keep the back flat against the pad.', 'Full control on the way back.'],
      commonMistakes: ['Letting the shoulders roll forward.', 'Using momentum instead of a controlled tempo.'],
    },
    trackingMode: 'reps-weight',
  },

  // ============================================================
  // HORIZONTAL PULL
  // ============================================================
  {
    id: 'bodyweight-inverted-row',
    name: 'Inverted row',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'horizontal-pull',
    muscles: { primary: ['back'], secondary: ['biceps'] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    // balance: 'medium' — a free-hanging body row demands real scapular/
    // core stability that a seated cable row or dumbbell row (both fixed
    // or externally supported) doesn't; see bodyweight-squat's comment.
    demands: { technical: 'medium', balance: 'medium', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A no-equipment horizontal pull using a sturdy table edge or low bar.',
      setup: ['Lie under a sturdy table/bar, grip the edge, body straight, heels on the floor.'],
      execution: ['Pull the chest up to the edge, squeezing the shoulder blades together.', 'Lower under control.'],
      cues: ['Pull with the elbows, not just the hands.', 'Keep the body in a straight line.'],
      commonMistakes: ['Letting the hips sag.', 'Using a half range of motion.'],
    },
    trackingMode: 'reps',
  },
  {
    id: 'band-row',
    name: 'Resistance-band row',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'horizontal-pull',
    muscles: { primary: ['back'], secondary: ['biceps'] },
    equipment: ['resistance-bands'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A band-resisted horizontal pull, easy to load anywhere.',
      setup: ['Anchor the band at chest height, step back to create tension.'],
      execution: ['Pull the band to the torso, squeezing the shoulder blades together.', 'Return under control.'],
      cues: ['Elbows travel straight back.', 'Squeeze at the end range.'],
      commonMistakes: ['Shrugging the shoulders up during the pull.', 'Using the low back to yank the band.'],
    },
    trackingMode: 'reps',
  },
  {
    id: 'dumbbell-row',
    name: 'Dumbbell row',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'horizontal-pull',
    muscles: { primary: ['back'], secondary: ['biceps'] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'medium', balance: 'medium', mobility: 'low', systemic: 'medium' },
    technique: {
      description: 'A single-arm dumbbell row with a large, controllable range of motion.',
      setup: ['One hand and knee on a bench, other foot on the floor, dumbbell in the free hand.'],
      execution: ['Pull the dumbbell to the hip, leading with the elbow.', 'Lower under control to a full stretch.'],
      cues: ['Keep the torso still, avoid rotating.', 'Lead with the elbow, not the hand.'],
      commonMistakes: ['Rotating the torso to help the pull.', 'Using a short, partial range of motion.'],
    },
    trackingMode: 'reps-weight-side',
  },
  {
    id: 'barbell-row',
    name: 'Barbell row',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'horizontal-pull',
    muscles: { primary: ['back'], secondary: ['biceps'] },
    equipment: ['barbell'],
    difficulty: 'intermediate',
    suitableGoals: ['stronger', 'muscle', 'athletic'],
    demands: { technical: 'high', balance: 'medium', mobility: 'medium', systemic: 'high' },
    technique: {
      description: 'A bilateral barbell pull that builds back thickness and pulling strength.',
      setup: ['Hinge forward to roughly 45 degrees, grip the bar just outside the legs.'],
      execution: ['Pull the bar to the lower ribs, squeezing the shoulder blades together.', 'Lower under control without losing the hinge.'],
      cues: ['Keep the hinge locked in throughout the set.', 'Pull the elbows back, not up.'],
      commonMistakes: ['Standing up out of the hinge on each rep.', 'Using momentum to heave the bar up.'],
    },
    trackingMode: 'reps-weight',
  },
  {
    id: 'seated-cable-row',
    name: 'Seated cable row',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'horizontal-pull',
    muscles: { primary: ['back'], secondary: ['biceps'] },
    equipment: ['cable'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'medium' },
    technique: {
      description: 'A seated, cable-resisted horizontal pull with consistent tension throughout.',
      setup: ['Sit with feet on the platform, knees slightly bent, grip the handle.'],
      execution: ['Pull the handle to the torso, squeezing the shoulder blades together.', 'Extend back out under control without rounding the back.'],
      cues: ['Chest up throughout.', 'Pull the elbows past the ribs.'],
      commonMistakes: ['Rounding the lower back at full stretch.', 'Using the legs to heave the weight.'],
    },
    trackingMode: 'reps-weight',
  },

  // ============================================================
  // VERTICAL PUSH
  // ============================================================
  {
    id: 'pike-push-up',
    name: 'Pike push-up',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'vertical-push',
    muscles: { primary: ['shoulders', 'triceps'], secondary: ['chest'] },
    equipment: ['bodyweight-only'],
    difficulty: 'intermediate',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'medium', balance: 'medium', mobility: 'high', systemic: 'medium' },
    technique: {
      description: 'A no-equipment vertical press using a pike (hips-high) position.',
      setup: ['Hips high in a pike position, hands under the shoulders.'],
      execution: ['Lower the head toward the floor between the hands.', 'Press back up to the starting pike position.'],
      cues: ['Keep the hips high throughout.', 'Head travels toward the hands, not forward.'],
      commonMistakes: ['Letting the hips drop, turning it into a regular push-up.', 'Flaring the elbows wide.'],
    },
    trackingMode: 'reps',
  },
  {
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell shoulder press',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'vertical-push',
    muscles: { primary: ['shoulders', 'triceps'], secondary: ['core'] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'medium', balance: 'medium', mobility: 'medium', systemic: 'medium' },
    technique: {
      description: 'A standing or seated vertical press for shoulder strength and size.',
      setup: ['Dumbbells at shoulder height, palms facing forward.'],
      execution: ['Press overhead until the arms are extended.', 'Lower under control back to shoulder height.'],
      cues: ['Brace the core, avoid overarching the back.', 'Press slightly back, not straight up.'],
      commonMistakes: ['Excessive lower-back arch.', 'Flaring the elbows out to 90 degrees at the bottom.'],
    },
    trackingMode: 'reps-weight',
  },
  {
    id: 'barbell-overhead-press',
    name: 'Barbell overhead press',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'vertical-push',
    muscles: { primary: ['shoulders', 'triceps'], secondary: ['core'] },
    equipment: ['barbell'],
    difficulty: 'intermediate',
    suitableGoals: ['stronger', 'muscle', 'athletic'],
    demands: { technical: 'high', balance: 'medium', mobility: 'high', systemic: 'high' },
    technique: {
      description: 'The primary barbell vertical press for shoulder and triceps strength.',
      setup: ['Bar racked at the shoulders, grip just outside shoulder width.'],
      execution: ['Brace the core and glutes, press the bar straight overhead.', 'Lower under control back to the shoulders.'],
      cues: ['Squeeze the glutes to protect the lower back.', 'Move the head back slightly as the bar passes the face.'],
      commonMistakes: ['Overarching the lower back to press.', 'Pressing the bar forward instead of straight up.'],
    },
    trackingMode: 'reps-weight',
  },
  {
    id: 'machine-shoulder-press',
    name: 'Machine shoulder press',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'vertical-push',
    muscles: { primary: ['shoulders', 'triceps'], secondary: [] },
    equipment: ['machine'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'medium' },
    technique: {
      description: 'A guided vertical press with no balance demand.',
      setup: ['Sit with back flat against the pad, handles at shoulder height.'],
      execution: ['Press the handles up until the arms are extended.', 'Return under control to shoulder height.'],
      cues: ['Keep the back flat against the pad.', 'Avoid shrugging at the top.'],
      commonMistakes: ['Arching off the back pad.', 'Using a short, partial range of motion.'],
    },
    trackingMode: 'reps-weight',
  },

  // ============================================================
  // VERTICAL PULL
  // ============================================================
  {
    id: 'pull-up',
    name: 'Pull-up',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'vertical-pull',
    muscles: { primary: ['back'], secondary: ['biceps'] },
    equipment: ['pull-up-bar'],
    difficulty: 'advanced',
    suitableGoals: ['stronger', 'muscle', 'athletic'],
    demands: { technical: 'medium', balance: 'low', mobility: 'medium', systemic: 'high' },
    technique: {
      description: 'A bodyweight vertical pull and one of the best back-strength benchmarks.',
      setup: ['Hang from the bar, hands just outside shoulder width.'],
      execution: ['Pull the chest toward the bar, driving the elbows down.', 'Lower under control to a full hang.'],
      cues: ['Lead with the chest.', 'Full extension at the bottom every rep.'],
      commonMistakes: ['Using momentum/kipping.', 'Stopping short of a full range of motion.'],
    },
    trackingMode: 'reps',
  },
  {
    id: 'lat-pulldown',
    name: 'Lat pulldown',
    category: 'strength',
    strengthType: 'compound',
    movementPattern: 'vertical-pull',
    muscles: { primary: ['back'], secondary: ['biceps'] },
    equipment: ['cable'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'medium', systemic: 'medium' },
    technique: {
      description: 'A machine-assisted vertical pull, a good pull-up regression or accessory.',
      setup: ['Sit under the bar, grip just outside shoulder width, thighs secured.'],
      execution: ['Pull the bar down to the upper chest, driving the elbows down.', 'Extend back up under control.'],
      cues: ['Lead with the elbows.', 'Avoid leaning back excessively.'],
      commonMistakes: ['Using body momentum to yank the bar down.', 'Pulling behind the neck.'],
    },
    trackingMode: 'reps-weight',
  },

  // ============================================================
  // ISOLATION — chest (horizontal-adduction)
  // ============================================================
  {
    id: 'dumbbell-chest-fly',
    name: 'Dumbbell chest fly',
    category: 'strength',
    strengthType: 'isolation',
    movementPattern: 'horizontal-adduction',
    muscles: { primary: ['chest'], secondary: ['shoulders'] },
    equipment: ['dumbbells', 'bench'],
    difficulty: 'intermediate',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'medium', balance: 'low', mobility: 'medium', systemic: 'low' },
    technique: {
      description: 'A chest isolation exercise done through a wide, stretch-focused arc.',
      setup: ['Lie on a bench, a dumbbell in each hand above the chest, palms facing in, slight elbow bend.'],
      execution: ['Lower the dumbbells out to the sides in a wide arc until a stretch is felt across the chest.', 'Bring them back together over the chest, squeezing at the top.'],
      cues: ['Keep the elbow bend fixed throughout.', 'Lead with the wrists, not the elbows.'],
      commonMistakes: ['Turning it into a press by bending the elbows more at the bottom.', 'Going so wide the shoulders round forward.'],
    },
    trackingMode: 'reps-weight',
  },
  {
    id: 'cable-chest-fly',
    name: 'Cable chest fly',
    category: 'strength',
    strengthType: 'isolation',
    movementPattern: 'horizontal-adduction',
    muscles: { primary: ['chest'], secondary: ['shoulders'] },
    equipment: ['cable'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A cable chest isolation exercise with constant tension through the whole range.',
      setup: ['Stand centered between two high cable pulleys, one handle in each hand, slight forward lean.'],
      execution: ['Bring the handles together in front of the chest in a wide arc.', 'Return under control to a full stretch.'],
      cues: ['Keep a slight, fixed elbow bend.', 'Squeeze the chest at full contraction.'],
      commonMistakes: ['Using the front delts to press instead of the chest to bring the arms together.', 'Letting the cables yank the arms back too far.'],
    },
    trackingMode: 'reps-weight',
  },

  // ============================================================
  // CARRY
  // ============================================================
  {
    id: 'farmers-carry',
    name: "Farmer's carry",
    category: 'carry',
    movementPattern: 'carry',
    muscles: { primary: ['core', 'back'], secondary: ['shoulders'] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'medium', mobility: 'low', systemic: 'medium' },
    technique: {
      description: 'A loaded carry that builds grip, core stability, and overall work capacity.',
      setup: ['A heavy dumbbell in each hand, standing tall.'],
      execution: ['Walk for the prescribed distance/time keeping the torso upright and braced.', 'Set the weights down under control.'],
      cues: ['Shoulders back and down.', 'Brace the core like you’re about to be tapped.'],
      commonMistakes: ['Letting the shoulders round forward.', 'Leaning to one side.'],
    },
    trackingMode: 'duration-weight',
  },

  // ============================================================
  // CORE
  // ============================================================
  {
    id: 'plank',
    name: 'Plank',
    category: 'core',
    movementPattern: 'core',
    muscles: { primary: ['core'], secondary: [] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A static core hold that builds trunk stability.',
      setup: ['Forearms and toes on the floor, body in a straight line.'],
      execution: ['Hold the position, keeping the hips level with the shoulders.', 'Breathe steadily throughout.'],
      cues: ['Squeeze the glutes.', 'Imagine pulling the elbows toward the toes.'],
      commonMistakes: ['Letting the hips sag.', 'Piking the hips up too high.'],
    },
    trackingMode: 'duration',
  },
  {
    id: 'dead-bug',
    name: 'Dead bug',
    category: 'core',
    movementPattern: 'core',
    muscles: { primary: ['core'], secondary: [] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'medium', balance: 'low', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A controlled anti-extension core exercise, gentle on the lower back.',
      setup: ['Lie on the back, arms reaching up, knees bent at 90 degrees.'],
      execution: ['Lower one arm and the opposite leg toward the floor without the lower back arching off the ground.', 'Return and alternate sides.'],
      cues: ['Keep the lower back pressed to the floor.', 'Move slowly and under control.'],
      commonMistakes: ['Letting the lower back arch off the floor.', 'Moving too fast to stay controlled.'],
    },
    // Reclassified 2026-08-16 (was 'reps'): real coaching convention
    // counts dead bug reps per side (alternating arm/leg pairs), not as
    // one shared rep count — matches cable-woodchop's own 'reps-side' a
    // few entries down.
    trackingMode: 'reps-side',
  },
  {
    id: 'hanging-knee-raise',
    name: 'Hanging knee raise',
    category: 'core',
    movementPattern: 'core',
    muscles: { primary: ['core'], secondary: [] },
    equipment: ['pull-up-bar'],
    difficulty: 'intermediate',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'medium', balance: 'low', mobility: 'medium', systemic: 'low' },
    technique: {
      description: 'A hanging core exercise that also builds grip endurance.',
      setup: ['Hang from a pull-up bar, arms fully extended.'],
      execution: ['Raise the knees toward the chest using the abs, not momentum.', 'Lower under control to a full hang.'],
      cues: ['Curl the pelvis under at the top.', 'Avoid swinging.'],
      commonMistakes: ['Using momentum/swinging to raise the legs.', 'Stopping the range short.'],
    },
    trackingMode: 'reps',
  },
  {
    id: 'cable-woodchop',
    name: 'Cable woodchop',
    category: 'core',
    movementPattern: 'core',
    muscles: { primary: ['core'], secondary: ['shoulders'] },
    equipment: ['cable'],
    difficulty: 'intermediate',
    suitableGoals: ['athletic', 'general-fitness'],
    demands: { technical: 'medium', balance: 'medium', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A rotational core exercise that trains anti-rotation strength and power transfer.',
      setup: ['Cable set high, stand sideways to the machine, both hands on the handle.'],
      execution: ['Pull the handle diagonally down and across the body, rotating through the torso.', 'Return under control and repeat.'],
      cues: ['Rotate from the torso, not just the arms.', 'Keep a slight knee bend throughout.'],
      commonMistakes: ['Using only the arms instead of rotating the torso.', 'Yanking the weight instead of controlling it.'],
    },
    trackingMode: 'reps-side',
  },
  {
    id: 'side-plank',
    name: 'Side plank',
    category: 'core',
    movementPattern: 'core',
    muscles: { primary: ['core'], secondary: [] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'medium', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A static lateral core hold that targets the obliques.',
      setup: ['Lie on one side, forearm on the floor under the shoulder, feet stacked.'],
      execution: ['Lift the hips until the body forms a straight line.', 'Hold, keeping the hips from dropping.'],
      cues: ['Stack the hips and shoulders.', 'Reach the top hand toward the ceiling for balance.'],
      commonMistakes: ['Letting the hips sag toward the floor.', 'Rotating the torso forward or back.'],
    },
    trackingMode: 'duration-side',
  },
  {
    id: 'cable-pallof-press',
    name: 'Cable Pallof press',
    category: 'core',
    movementPattern: 'core',
    muscles: { primary: ['core'], secondary: ['shoulders'] },
    equipment: ['cable'],
    difficulty: 'intermediate',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'medium', balance: 'medium', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'An anti-rotation core exercise — resisting the cable’s pull to the side, rather than moving through rotation.',
      setup: ['Stand sideways to a cable set at chest height, handle held with both hands at the sternum.'],
      execution: ['Press the handle straight out in front of the chest, resisting the pull toward the machine.', 'Hold briefly, then return under control without letting the torso rotate.'],
      cues: ['Brace like you’re about to be pushed.', 'Keep the hips and shoulders square to the front throughout.'],
      commonMistakes: ['Letting the torso rotate toward the cable.', 'Pressing out too fast and losing tension.'],
    },
    trackingMode: 'reps-side',
  },

  // ============================================================
  // ISOLATION — biceps (elbow-flexion)
  // ============================================================
  {
    id: 'dumbbell-biceps-curl',
    name: 'Dumbbell biceps curl',
    category: 'strength',
    strengthType: 'isolation',
    movementPattern: 'elbow-flexion',
    muscles: { primary: ['biceps'], secondary: [] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A single-joint exercise isolating the biceps.',
      setup: ['Stand tall, a dumbbell in each hand at the sides, palms forward.'],
      execution: ['Curl the dumbbells up toward the shoulders without swinging the torso.', 'Lower under control to full extension.'],
      cues: ['Keep the elbows pinned to the sides.', 'Squeeze at the top.'],
      commonMistakes: ['Swinging the torso to help the curl.', 'Only using half the range of motion.'],
    },
    trackingMode: 'reps-weight',
  },
  {
    id: 'band-biceps-curl',
    name: 'Band biceps curl',
    category: 'strength',
    strengthType: 'isolation',
    movementPattern: 'elbow-flexion',
    muscles: { primary: ['biceps'], secondary: [] },
    equipment: ['resistance-bands'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A band-resisted biceps isolation exercise, easy to load at home.',
      setup: ['Stand on the band, one handle in each hand at the sides.'],
      execution: ['Curl the hands up toward the shoulders.', 'Lower under control to full extension.'],
      cues: ['Keep the elbows still.', 'Control the band on the way down.'],
      commonMistakes: ['Letting the elbows drift forward.', 'Letting the band snap back uncontrolled.'],
    },
    trackingMode: 'reps',
  },
  {
    id: 'cable-biceps-curl',
    name: 'Cable biceps curl',
    category: 'strength',
    strengthType: 'isolation',
    movementPattern: 'elbow-flexion',
    muscles: { primary: ['biceps'], secondary: [] },
    equipment: ['cable'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A cable biceps isolation exercise with constant tension.',
      setup: ['Stand facing a low cable pulley with a straight or EZ-bar attachment.'],
      execution: ['Curl the bar up toward the shoulders, elbows pinned to the sides.', 'Lower under control to full extension.'],
      cues: ['Keep the elbows still throughout.', 'Squeeze hard at the top.'],
      commonMistakes: ['Leaning back to help the curl.', 'Letting the elbows drift forward.'],
    },
    trackingMode: 'reps-weight',
  },

  // ============================================================
  // ISOLATION — triceps (elbow-extension)
  // ============================================================
  {
    id: 'triceps-pushdown',
    name: 'Triceps pushdown',
    category: 'strength',
    strengthType: 'isolation',
    movementPattern: 'elbow-extension',
    muscles: { primary: ['triceps'], secondary: [] },
    equipment: ['cable'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A cable triceps isolation exercise with constant tension.',
      setup: ['Stand facing a high cable pulley with a bar or rope attachment.'],
      execution: ['Extend the elbows down until the arms are straight, keeping the elbows pinned to the sides.', 'Return under control.'],
      cues: ['Keep the elbows still, pinned at the sides.', 'Squeeze at full extension.'],
      commonMistakes: ['Letting the elbows drift forward/away from the body.', 'Using the shoulders to help push.'],
    },
    trackingMode: 'reps-weight',
  },
  {
    id: 'dumbbell-overhead-triceps-extension',
    name: 'Dumbbell overhead triceps extension',
    category: 'strength',
    strengthType: 'isolation',
    movementPattern: 'elbow-extension',
    muscles: { primary: ['triceps'], secondary: [] },
    equipment: ['dumbbells'],
    difficulty: 'intermediate',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'medium', balance: 'low', mobility: 'medium', systemic: 'low' },
    technique: {
      description: 'A stretch-focused triceps isolation exercise done overhead.',
      setup: ['Hold one dumbbell with both hands overhead, arms extended.'],
      execution: ['Lower the dumbbell behind the head by bending the elbows.', 'Extend back to the starting position.'],
      cues: ['Keep the elbows pointed forward, close to the head.', 'Control the stretch at the bottom.'],
      commonMistakes: ['Letting the elbows flare out wide.', 'Arching the lower back to compensate.'],
    },
    trackingMode: 'reps-weight',
  },
  {
    id: 'bench-dip',
    name: 'Bench dip',
    category: 'strength',
    strengthType: 'isolation',
    movementPattern: 'elbow-extension',
    muscles: { primary: ['triceps'], secondary: ['shoulders'] },
    equipment: ['bodyweight-only', 'bench'],
    difficulty: 'intermediate',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'medium', balance: 'low', mobility: 'medium', systemic: 'low' },
    technique: {
      description: 'A bodyweight triceps isolation exercise using a bench edge.',
      setup: ['Hands on the bench edge behind you, legs extended, hips just in front of the bench.'],
      execution: ['Lower the hips straight down by bending the elbows.', 'Press back up to full extension.'],
      cues: ['Keep the elbows tracking straight back.', 'Keep the hips close to the bench.'],
      commonMistakes: ['Letting the shoulders roll forward at the bottom.', 'Flaring the elbows out to the sides.'],
    },
    trackingMode: 'reps',
  },

  // ============================================================
  // ISOLATION — shoulders (shoulder-abduction)
  // ============================================================
  {
    id: 'dumbbell-lateral-raise',
    name: 'Dumbbell lateral raise',
    category: 'strength',
    strengthType: 'isolation',
    movementPattern: 'shoulder-abduction',
    muscles: { primary: ['shoulders'], secondary: [] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'The primary isolation exercise for the side (lateral) deltoid.',
      setup: ['Stand tall, a light dumbbell in each hand at the sides.'],
      execution: ['Raise the arms out to the sides until roughly shoulder height.', 'Lower under control.'],
      cues: ['Lead with the elbows, not the hands.', 'Avoid shrugging the shoulders up.'],
      commonMistakes: ['Using momentum/swinging the weight up.', 'Raising past shoulder height, involving the traps.'],
    },
    trackingMode: 'reps-weight',
  },
  {
    id: 'band-lateral-raise',
    name: 'Band lateral raise',
    category: 'strength',
    strengthType: 'isolation',
    movementPattern: 'shoulder-abduction',
    muscles: { primary: ['shoulders'], secondary: [] },
    equipment: ['resistance-bands'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A band-resisted lateral raise, easy to load at home.',
      setup: ['Stand on the band, one handle in each hand at the sides.'],
      execution: ['Raise the arms out to the sides until roughly shoulder height.', 'Lower under control.'],
      cues: ['Lead with the elbows.', 'Keep a slight bend in the elbows throughout.'],
      commonMistakes: ['Using momentum to swing the arms up.', 'Shrugging the shoulders up.'],
    },
    trackingMode: 'reps',
  },

  // ============================================================
  // ISOLATION — rear delts / upper back (horizontal-pull, isolation)
  // ============================================================
  // Deliberately tagged movementPattern: 'horizontal-pull', same as the
  // compound rows above — strengthType: 'isolation' is what makes
  // select-exercises.ts's ranking correctly prefer this for an
  // *accessory* horizontal-pull slot over a compound row, the same way
  // dumbbell-chest-fly (horizontal-adduction) sits alongside the
  // horizontal-push presses. No new MovementPattern needed.
  {
    id: 'cable-face-pull',
    name: 'Cable face pull',
    category: 'strength',
    strengthType: 'isolation',
    movementPattern: 'horizontal-pull',
    muscles: { primary: ['shoulders'], secondary: ['back'] },
    equipment: ['cable'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A rear-delt and upper-back isolation pull that also reinforces healthy shoulder positioning.',
      setup: ['Set a cable with a rope attachment at face height, grip with both hands, palms facing in.'],
      execution: ['Pull the rope toward the face, separating the hands and driving the elbows out and back.', 'Return under control to a full stretch.'],
      cues: ['Lead with the elbows, high and wide.', 'Squeeze the shoulder blades together at the end.'],
      commonMistakes: ['Pulling low, toward the chest instead of the face.', 'Using the arms only, without rotating at the shoulder.'],
    },
    trackingMode: 'reps-weight',
  },

  // ============================================================
  // ISOLATION — quads (knee-extension)
  // ============================================================
  {
    id: 'leg-extension',
    name: 'Leg extension',
    category: 'strength',
    strengthType: 'isolation',
    movementPattern: 'knee-extension',
    muscles: { primary: ['quadriceps'], secondary: [] },
    equipment: ['machine'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A machine isolation exercise for the quadriceps.',
      setup: ['Sit in the machine, shins behind the pad, back flat against the seat.'],
      execution: ['Extend the knees until the legs are straight.', 'Lower under control.'],
      cues: ['Squeeze the quads at the top.', 'Control the negative rather than dropping the weight.'],
      commonMistakes: ['Using momentum to kick the weight up.', 'Only using a partial range of motion.'],
    },
    trackingMode: 'reps-weight',
  },

  // ============================================================
  // ISOLATION — hamstrings (knee-flexion)
  // ============================================================
  {
    id: 'leg-curl',
    name: 'Leg curl',
    category: 'strength',
    strengthType: 'isolation',
    movementPattern: 'knee-flexion',
    muscles: { primary: ['hamstrings'], secondary: [] },
    equipment: ['machine'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A machine isolation exercise for the hamstrings.',
      setup: ['Lie face down (or seated, depending on the machine), pad against the back of the ankles.'],
      execution: ['Curl the heels toward the glutes.', 'Lower under control.'],
      cues: ['Squeeze the hamstrings at the top.', 'Avoid lifting the hips off the pad.'],
      commonMistakes: ['Using momentum to swing the weight up.', 'Lifting the hips to help the curl.'],
    },
    trackingMode: 'reps-weight',
  },

  // ============================================================
  // ISOLATION — calves (calf-raise)
  // ============================================================
  {
    id: 'bodyweight-calf-raise',
    name: 'Bodyweight calf raise',
    category: 'strength',
    strengthType: 'isolation',
    movementPattern: 'calf-raise',
    muscles: { primary: ['calves'], secondary: [] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A no-equipment calf isolation exercise.',
      setup: ['Stand tall, feet hip-width, near a wall for balance if needed.'],
      execution: ['Rise up onto the toes as high as possible.', 'Lower under control to a full stretch.'],
      cues: ['Rise straight up, not rocking forward.', 'Pause briefly at the top.'],
      commonMistakes: ['Bouncing instead of controlling the tempo.', 'Only using a partial range of motion.'],
    },
    trackingMode: 'reps',
  },
  {
    id: 'machine-calf-raise',
    name: 'Machine calf raise',
    category: 'strength',
    strengthType: 'isolation',
    movementPattern: 'calf-raise',
    muscles: { primary: ['calves'], secondary: [] },
    equipment: ['machine'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A loaded machine calf isolation exercise.',
      setup: ['Shoulders under the pads (or feet on the platform, depending on machine), balls of the feet on the edge.'],
      execution: ['Rise up onto the toes as high as possible.', 'Lower under control to a full stretch.'],
      cues: ['Full range of motion each rep.', 'Pause briefly at the top.'],
      commonMistakes: ['Bouncing at the bottom instead of controlling it.', 'Using a short, partial range of motion.'],
    },
    trackingMode: 'reps-weight',
  },

  // ============================================================
  // ISOLATION — glute medius (hip-abduction)
  // ============================================================
  {
    id: 'band-lateral-walk',
    name: 'Band lateral walk',
    category: 'strength',
    strengthType: 'isolation',
    movementPattern: 'hip-abduction',
    muscles: { primary: ['glutes'], secondary: [] },
    equipment: ['resistance-bands'],
    difficulty: 'beginner',
    suitableGoals: ['athletic', 'general-fitness', 'muscle'],
    demands: { technical: 'low', balance: 'medium', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A band-resisted lateral walk that isolates the glute medius.',
      setup: ['Band around the legs above the knees or ankles, feet hip-width, knees slightly bent.'],
      execution: ['Step sideways, keeping tension on the band throughout.', 'Continue for the prescribed number of steps, then reverse direction.'],
      cues: ['Stay low the whole time.', 'Keep the toes pointed forward.'],
      commonMistakes: ['Standing up tall, losing tension.', 'Letting the feet drift into a narrow stance.'],
    },
    trackingMode: 'reps-side',
  },
  {
    id: 'machine-hip-abduction',
    name: 'Machine hip abduction',
    category: 'strength',
    strengthType: 'isolation',
    movementPattern: 'hip-abduction',
    muscles: { primary: ['glutes'], secondary: [] },
    equipment: ['machine'],
    difficulty: 'beginner',
    suitableGoals: ['athletic', 'general-fitness', 'muscle'],
    demands: { technical: 'low', balance: 'low', mobility: 'low', systemic: 'low' },
    technique: {
      description: 'A seated, machine-guided glute medius isolation exercise — a standard-gym equivalent to the band lateral walk.',
      setup: ['Sit in the machine, outer thighs against the pads, back flat against the seat.'],
      execution: ['Push the legs apart against the resistance until fully open.', 'Return under control without letting the weight stack slam.'],
      cues: ['Keep the back flat against the pad.', 'Control the return, don’t let the resistance snap the legs shut.'],
      commonMistakes: ['Using a fast, bouncy tempo.', 'Only using a partial range of motion.'],
    },
    trackingMode: 'reps-weight',
  },

  // ============================================================
  // WARM-UP / COOL-DOWN
  // ============================================================
  {
    id: 'dynamic-warmup-flow',
    name: 'Dynamic warm-up flow',
    category: 'warmup',
    movementPattern: 'core',
    muscles: { primary: ['core'], secondary: ['quadriceps', 'hamstrings', 'shoulders'] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'medium', systemic: 'low' },
    technique: {
      description: 'A short full-body movement flow to raise heart rate and prime the joints before training.',
      setup: ['Clear space to move through a few steps in each direction.'],
      execution: ['Cycle through bodyweight squats, leg swings, arm circles and light lunges.', 'Keep the effort light — this is preparation, not the workout.'],
      cues: ['Move through a full range of motion.', 'Gradually increase effort each round.'],
      commonMistakes: ['Skipping it and going straight into heavy work cold.', 'Turning it into a fatiguing effort before the session even starts.'],
    },
    trackingMode: 'duration',
  },
  {
    id: 'standing-quad-stretch',
    name: 'Standing quad stretch',
    category: 'cooldown',
    movementPattern: 'squat',
    muscles: { primary: ['quadriceps'], secondary: [] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'medium', mobility: 'high', systemic: 'low' },
    technique: {
      description: 'A post-workout static stretch for the front of the thigh.',
      setup: ['Stand tall, holding onto something for balance if needed.'],
      execution: ['Grab one foot behind you and gently pull the heel toward the glutes.', 'Hold, then switch sides.'],
      cues: ['Keep the knees close together.', 'Stand tall rather than leaning forward.'],
      commonMistakes: ['Yanking the foot instead of easing into the stretch.', 'Arching the lower back to compensate.'],
    },
    trackingMode: 'duration-side',
  },
  {
    id: 'hamstring-stretch',
    name: 'Standing hamstring stretch',
    category: 'cooldown',
    movementPattern: 'hinge',
    muscles: { primary: ['hamstrings'], secondary: [] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'high', systemic: 'low' },
    technique: {
      description: 'A post-workout static stretch for the back of the thigh.',
      setup: ['Stand tall, one heel propped on a low surface, leg straight.'],
      execution: ['Hinge forward from the hips until a stretch is felt in the back of the thigh.', 'Hold, then switch sides.'],
      cues: ['Hinge from the hips, keep the back flat.', 'Ease in gradually rather than forcing it.'],
      commonMistakes: ['Rounding the back to reach further.', 'Bouncing instead of holding steady.'],
    },
    trackingMode: 'duration',
  },
  {
    // Added 2026-08-17 alongside Workout Mode's warm-up/cool-down
    // assignment (rules/warmup-cooldown.ts) — the library previously had
    // no upper-body-specific warm-up at all, only the general full-body
    // flow and two lower-body-leaning stretches.
    id: 'upper-body-dynamic-warmup',
    name: 'Upper body dynamic warm-up',
    category: 'warmup',
    movementPattern: 'horizontal-pull',
    muscles: { primary: ['shoulders'], secondary: ['chest', 'back'] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'medium', systemic: 'low' },
    technique: {
      description: 'A short upper-body movement flow to prime the shoulders and upper back before pressing/pulling work.',
      setup: ['Clear space to move the arms freely in every direction.'],
      execution: ['Cycle through arm circles, band-free pull-aparts (or shoulder blade squeezes), and light torso twists.', 'Keep the effort light — this is preparation, not the workout.'],
      cues: ['Move through a full range of motion.', 'Gradually increase reach each round.'],
      commonMistakes: ['Skipping straight into heavy pressing/pulling cold.', 'Rushing through with a small range of motion.'],
    },
    trackingMode: 'duration',
  },
  {
    id: 'cross-body-shoulder-stretch',
    name: 'Cross-body shoulder stretch',
    category: 'cooldown',
    movementPattern: 'horizontal-pull',
    muscles: { primary: ['shoulders'], secondary: ['back'] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['stronger', 'muscle', 'athletic', 'general-fitness'],
    demands: { technical: 'low', balance: 'low', mobility: 'high', systemic: 'low' },
    technique: {
      description: 'A post-workout static stretch for the rear shoulder and upper back.',
      setup: ['Stand tall, bring one arm straight across the chest.'],
      execution: ['Use the other arm to gently pull the extended arm closer to the chest.', 'Hold, then switch sides.'],
      cues: ['Keep the shoulder of the extended arm relaxed, down away from the ear.', 'Ease in gradually rather than forcing it.'],
      commonMistakes: ['Shrugging the shoulder up toward the ear.', 'Yanking the arm instead of easing into the stretch.'],
    },
    trackingMode: 'duration-side',
  },
];
