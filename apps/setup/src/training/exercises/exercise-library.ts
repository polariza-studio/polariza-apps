// The approved exercise library. Every exercise the generator assigns must
// come from here — spec §4.2: "The generator must not invent exercises that
// do not exist in the SetUp exercise library."
//
// Seed data: 20 common, well-established exercises covering every
// movementPattern the current splits (training/rules/splits.ts) use —
// squat, hinge, lunge, horizontal/vertical push & pull, core — across
// bodyweight, dumbbell, barbell, resistance-band, and pull-up-bar equipment
// tiers, so the generator has real candidates for both gym and home users
// at every experience level.
//
// The movements and technique cues follow widely-established coaching
// consensus for these specific exercises (not contested programming
// science like training/rules/*.ts), but have not been reviewed by a
// certified professional — treat this as a functional starting point, not
// final authoritative guidance. suggestedWeight is never set here for the
// same "no fake precision" reason as prescribe-exercise.ts.

import type { Exercise } from '../../domain/exercise';

export const exerciseLibrary: Exercise[] = [
  // --- squat ---------------------------------------------------------
  {
    id: 'bodyweight-squat',
    name: 'Bodyweight squat',
    movementPattern: 'squat',
    muscles: { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings'] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['general-fitness', 'athletic', 'muscle'],
    technique: {
      setup: ['Stand with feet shoulder-width apart, toes slightly turned out.'],
      execution: [
        'Sit the hips back and down, keeping the chest up and knees tracking over the toes.',
        'Descend until thighs are roughly parallel to the floor, then drive through the whole foot to stand.',
      ],
      cues: ['Push the floor away.', 'Keep the chest tall.'],
      commonMistakes: ['Letting the knees cave inward.', 'Lifting the heels off the floor.'],
    },
  },
  {
    id: 'goblet-squat',
    name: 'Goblet squat',
    movementPattern: 'squat',
    muscles: { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings', 'core'] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'general-fitness', 'athletic', 'stronger'],
    technique: {
      setup: ['Hold one dumbbell vertically at chest height with both hands.'],
      execution: [
        'Squat down between the knees, keeping the dumbbell close to the chest.',
        'Drive through the feet to return to standing.',
      ],
      cues: ['Elbows point down, not out.', 'Keep the dumbbell close to the body.'],
      commonMistakes: ['Rounding the lower back at the bottom.', 'Letting the dumbbell drift forward.'],
    },
  },
  {
    id: 'barbell-back-squat',
    name: 'Barbell back squat',
    movementPattern: 'squat',
    muscles: { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings', 'back'] },
    equipment: ['barbell'],
    difficulty: 'intermediate',
    suitableGoals: ['stronger', 'muscle', 'athletic'],
    demands: { technical: 'medium', balance: 'medium' },
    technique: {
      setup: ['Bar racked on the upper back, feet shoulder-width, unrack and step back.'],
      execution: [
        'Brace the core, sit the hips back and down under control.',
        'Drive through the mid-foot to return to standing, keeping the bar path vertical.',
      ],
      cues: ['Brace before you break.', 'Spread the floor with your feet.'],
      commonMistakes: ['Losing core brace at the bottom.', 'Letting the bar drift forward over the toes.'],
    },
  },

  // --- hinge -----------------------------------------------------------
  {
    id: 'glute-bridge',
    name: 'Glute bridge',
    movementPattern: 'hinge',
    muscles: { primary: ['glutes'], secondary: ['hamstrings', 'core'] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['general-fitness', 'muscle', 'athletic'],
    technique: {
      setup: ['Lie on the back, knees bent, feet flat on the floor hip-width apart.'],
      execution: [
        'Squeeze the glutes to lift the hips until the body forms a straight line knee-to-shoulder.',
        'Lower under control back to the start.',
      ],
      cues: ['Squeeze the glutes at the top, don’t just push with the lower back.'],
      commonMistakes: ['Overarching the lower back at the top.', 'Pushing mostly through the heels vs. squeezing the glutes.'],
    },
  },
  {
    id: 'dumbbell-romanian-deadlift',
    name: 'Dumbbell Romanian deadlift',
    movementPattern: 'hinge',
    muscles: { primary: ['hamstrings', 'glutes'], secondary: ['back'] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'general-fitness', 'athletic', 'stronger'],
    technique: {
      setup: ['Hold a dumbbell in each hand in front of the thighs, feet hip-width apart.'],
      execution: [
        'Push the hips back while keeping a soft knee bend, lowering the dumbbells along the legs.',
        'Feel a stretch in the hamstrings, then drive the hips forward to stand tall.',
      ],
      cues: ['Hinge at the hips, not the waist.', 'Keep the dumbbells close to the legs.'],
      commonMistakes: ['Rounding the back instead of hinging.', 'Turning it into a squat by bending the knees too much.'],
    },
  },
  {
    id: 'barbell-deadlift',
    name: 'Barbell deadlift',
    movementPattern: 'hinge',
    muscles: { primary: ['hamstrings', 'glutes', 'back'], secondary: ['core'] },
    equipment: ['barbell'],
    difficulty: 'advanced',
    suitableGoals: ['stronger', 'muscle', 'athletic'],
    demands: { technical: 'high', balance: 'medium' },
    technique: {
      setup: ['Bar over mid-foot, shins close to the bar, grip just outside the legs.'],
      execution: [
        'Brace the core and flatten the back, then drive through the floor to stand, keeping the bar close to the body.',
        'Lower under control by pushing the hips back first.',
      ],
      cues: ['Drag the bar up the legs.', 'Brace like someone’s about to press on your stomach.'],
      commonMistakes: ['Rounding the lower back.', 'Letting the bar drift away from the shins.'],
    },
  },

  // --- lunge -------------------------------------------------------------
  {
    id: 'bodyweight-lunge',
    name: 'Bodyweight lunge',
    movementPattern: 'lunge',
    muscles: { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings', 'adductors'] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['general-fitness', 'athletic', 'muscle'],
    technique: {
      setup: ['Stand tall with feet hip-width apart.'],
      execution: [
        'Step forward and lower the back knee toward the floor, keeping the front shin roughly vertical.',
        'Push through the front foot to return to standing.',
      ],
      cues: ['Keep the torso upright.', 'Front knee tracks over the foot, not past it.'],
      commonMistakes: ['Letting the front knee cave inward.', 'Taking a step that’s too short, driving the knee forward.'],
    },
  },
  {
    id: 'dumbbell-walking-lunge',
    name: 'Dumbbell walking lunge',
    movementPattern: 'lunge',
    muscles: { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings', 'adductors', 'core'] },
    equipment: ['dumbbells'],
    difficulty: 'intermediate',
    suitableGoals: ['muscle', 'athletic', 'general-fitness'],
    demands: { balance: 'medium' },
    technique: {
      setup: ['Hold a dumbbell in each hand at the sides, standing tall.'],
      execution: [
        'Step forward into a lunge, lowering the back knee toward the floor.',
        'Drive through the front foot to bring the back foot through into the next step.',
      ],
      cues: ['Stay tall through the torso.', 'Control the descent, don’t drop into it.'],
      commonMistakes: ['Leaning too far forward.', 'Rushing the steps and losing balance.'],
    },
  },

  // --- horizontal-push -----------------------------------------------
  {
    id: 'push-up',
    name: 'Push-up',
    movementPattern: 'horizontal-push',
    muscles: { primary: ['chest', 'triceps'], secondary: ['shoulders', 'core'] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['general-fitness', 'athletic', 'muscle'],
    technique: {
      setup: ['Hands slightly wider than shoulders, body in a straight line from head to heels.'],
      execution: [
        'Lower the chest toward the floor with elbows at roughly 45° from the body.',
        'Press back up to full arm extension without losing the straight body line.',
      ],
      cues: ['Body stays rigid like a plank.', 'Elbows at 45°, not flared to 90°.'],
      commonMistakes: ['Letting the hips sag.', 'Only lowering part-way.'],
    },
  },
  {
    id: 'dumbbell-bench-press',
    name: 'Dumbbell bench press',
    movementPattern: 'horizontal-push',
    muscles: { primary: ['chest', 'triceps'], secondary: ['shoulders'] },
    equipment: ['dumbbells', 'bench'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'stronger', 'general-fitness', 'athletic'],
    technique: {
      setup: ['Lie on the bench with a dumbbell in each hand at chest level, feet flat on the floor.'],
      execution: [
        'Press the dumbbells up until the arms are extended over the chest.',
        'Lower under control back to chest level.',
      ],
      cues: ['Keep the shoulder blades pulled together on the bench.'],
      commonMistakes: ['Flaring the elbows out to 90°.', 'Bouncing the dumbbells at the bottom.'],
    },
  },
  {
    id: 'barbell-bench-press',
    name: 'Barbell bench press',
    movementPattern: 'horizontal-push',
    muscles: { primary: ['chest', 'triceps'], secondary: ['shoulders'] },
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
    suitableGoals: ['stronger', 'muscle'],
    demands: { technical: 'medium' },
    technique: {
      setup: ['Lie on the bench, grip just wider than shoulder-width, bar over the chest.'],
      execution: [
        'Lower the bar under control to the mid-chest.',
        'Press back up to full arm extension.',
      ],
      cues: ['Keep the shoulder blades pinned back.', 'Drive the feet into the floor.'],
      commonMistakes: ['Bouncing the bar off the chest.', 'Letting the hips lift off the bench.'],
    },
  },

  // --- horizontal-pull -----------------------------------------------
  {
    id: 'dumbbell-bent-over-row',
    name: 'Dumbbell bent-over row',
    movementPattern: 'horizontal-pull',
    muscles: { primary: ['back'], secondary: ['biceps', 'shoulders'] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'general-fitness', 'athletic', 'stronger'],
    technique: {
      setup: ['Hinge forward at the hips with a flat back, a dumbbell in each hand.'],
      execution: [
        'Pull the dumbbells toward the lower ribs, squeezing the shoulder blades together.',
        'Lower under control back to the start.',
      ],
      cues: ['Lead with the elbows.', 'Keep the back flat throughout.'],
      commonMistakes: ['Rounding the back.', 'Using momentum instead of the back muscles to move the weight.'],
    },
  },
  {
    id: 'barbell-bent-over-row',
    name: 'Barbell bent-over row',
    movementPattern: 'horizontal-pull',
    muscles: { primary: ['back'], secondary: ['biceps'] },
    equipment: ['barbell'],
    difficulty: 'intermediate',
    suitableGoals: ['stronger', 'muscle'],
    demands: { technical: 'medium' },
    technique: {
      setup: ['Hinge forward with a flat back, holding the bar with an overhand grip.'],
      execution: [
        'Pull the bar toward the lower ribs, squeezing the shoulder blades together.',
        'Lower under control without losing the hinge position.',
      ],
      cues: ['Keep the hinge locked in for the whole set.'],
      commonMistakes: ['Standing up out of the hinge on each rep.', 'Rounding the lower back.'],
    },
  },
  {
    id: 'band-seated-row',
    name: 'Resistance band seated row',
    movementPattern: 'horizontal-pull',
    muscles: { primary: ['back'], secondary: ['biceps'] },
    equipment: ['resistance-bands'],
    difficulty: 'beginner',
    suitableGoals: ['general-fitness', 'muscle', 'athletic'],
    technique: {
      setup: ['Sit with legs extended, band looped around the feet, one handle in each hand.'],
      execution: [
        'Pull the handles toward the torso, squeezing the shoulder blades together.',
        'Extend the arms back out under control.',
      ],
      cues: ['Keep the torso upright, don’t lean back to pull.'],
      commonMistakes: ['Using the torso lean instead of the back to move the band.', 'Shrugging the shoulders up toward the ears.'],
    },
  },

  // --- vertical-push -------------------------------------------------
  {
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell shoulder press',
    movementPattern: 'vertical-push',
    muscles: { primary: ['shoulders'], secondary: ['triceps'] },
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    suitableGoals: ['muscle', 'general-fitness', 'athletic', 'stronger'],
    technique: {
      setup: ['Stand or sit tall, a dumbbell in each hand at shoulder height.'],
      execution: [
        'Press the dumbbells overhead until the arms are extended.',
        'Lower under control back to shoulder height.',
      ],
      cues: ['Brace the core, avoid overarching the lower back.'],
      commonMistakes: ['Flaring the ribs and arching the back to press.', 'Pressing the dumbbells forward instead of straight up.'],
    },
  },
  {
    id: 'barbell-overhead-press',
    name: 'Barbell overhead press',
    movementPattern: 'vertical-push',
    muscles: { primary: ['shoulders'], secondary: ['triceps', 'core'] },
    equipment: ['barbell'],
    difficulty: 'intermediate',
    suitableGoals: ['stronger', 'muscle'],
    demands: { technical: 'medium' },
    technique: {
      setup: ['Bar racked at shoulder height, grip just outside the shoulders.'],
      execution: [
        'Brace the core and press the bar overhead, moving the head back slightly to let the bar pass.',
        'Lower under control back to the shoulders.',
      ],
      cues: ['Squeeze the glutes to keep the ribs down.'],
      commonMistakes: ['Overarching the lower back to press.', 'Pressing the bar forward instead of straight up.'],
    },
  },

  // --- vertical-pull -------------------------------------------------
  {
    id: 'band-pulldown',
    name: 'Resistance band pulldown',
    movementPattern: 'vertical-pull',
    muscles: { primary: ['back'], secondary: ['biceps'] },
    equipment: ['resistance-bands'],
    difficulty: 'beginner',
    suitableGoals: ['general-fitness', 'muscle'],
    technique: {
      setup: ['Anchor the band overhead, kneel or sit facing the anchor, one handle in each hand.'],
      execution: [
        'Pull the handles down and out toward the hips, squeezing the shoulder blades down and together.',
        'Extend the arms back up under control.',
      ],
      cues: ['Lead with the elbows, not the hands.'],
      commonMistakes: ['Leaning back to use body weight instead of the back muscles.', 'Shrugging up toward the ears.'],
    },
  },
  {
    id: 'pull-up',
    name: 'Pull-up',
    movementPattern: 'vertical-pull',
    muscles: { primary: ['back'], secondary: ['biceps', 'shoulders'] },
    equipment: ['pull-up-bar'],
    difficulty: 'advanced',
    suitableGoals: ['stronger', 'muscle', 'athletic'],
    demands: { technical: 'medium' },
    technique: {
      setup: ['Hang from the bar with an overhand grip, slightly wider than shoulders.'],
      execution: [
        'Pull the chest up toward the bar, driving the elbows down and back.',
        'Lower under control back to a full hang.',
      ],
      cues: ['Lead with the chest.', 'Full range: dead hang to chin over the bar.'],
      commonMistakes: ['Kipping/swinging to generate momentum.', 'Only completing the top half of the range.'],
    },
  },

  // --- core ------------------------------------------------------------
  {
    id: 'plank',
    name: 'Plank',
    movementPattern: 'core',
    muscles: { primary: ['core'], secondary: [] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['general-fitness', 'athletic', 'muscle', 'stronger'],
    technique: {
      setup: ['Forearms on the floor, elbows under shoulders, body in a straight line.'],
      execution: ['Hold the position, keeping the hips level with the shoulders.'],
      cues: ['Squeeze the glutes and brace the abs.', 'Imagine pulling the elbows toward the toes.'],
      commonMistakes: ['Letting the hips sag toward the floor.', 'Piking the hips up too high.'],
    },
  },
  {
    id: 'dead-bug',
    name: 'Dead bug',
    movementPattern: 'core',
    muscles: { primary: ['core'], secondary: [] },
    equipment: ['bodyweight-only'],
    difficulty: 'beginner',
    suitableGoals: ['general-fitness', 'athletic'],
    demands: { mobility: 'low' },
    technique: {
      setup: ['Lie on the back, arms reaching toward the ceiling, knees bent at 90° over the hips.'],
      execution: [
        'Lower one arm overhead and the opposite leg toward the floor, keeping the lower back pressed down.',
        'Return to the start and switch sides.',
      ],
      cues: ['Keep the lower back glued to the floor the whole time.'],
      commonMistakes: ['Letting the lower back arch off the floor.', 'Moving too fast to control the range.'],
    },
  },
];
