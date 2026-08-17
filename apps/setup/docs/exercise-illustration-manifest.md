# SetUp — Exercise Illustration Manifest

Working document for the exercise illustration system (not consumed by any code — the source of truth for exercise data remains `src/training/exercises/exercise-library.ts`). Built from a fresh read of that file (58 exercises, confirmed against its own header count). All 58 currently have `imagePath: undefined` — asset status is **missing** for every row except the 6 Phase 2 calibration exercises noted below, which are illustrated but not yet reviewed/approved or wired in.

Visual style reference (from 4 user-provided reference images): black outline linework, medium consistent weight, selective solid-black fills on clothing/hair, equipment shown with halftone/dot or flat fill shading, minimal facial detail, athletic female figure, socks + laced sneakers. See `2026-08-16` conversation history for the full style/character/composition spec used to brief generation prompts.

## Status

- **Phase 1 (manifest) — approved 2026-08-16.**
- **Phase 2 (calibration set) — approved to start 2026-08-16.** 6 exercises illustrated via user-run external generation (no image-gen tool available in this session): `hip-thrust`, `goblet-squat`, `machine-hip-abduction`, `cable-face-pull`, `dumbbell-step-up`, `dead-bug`. Awaiting user's visual review/approval before Phase 3.
- **Phase 3 (complete library + `imagePath` wiring)** — not started.

## Legend
- **Angle**: side / 3-4 / front
- **Status**: `missing` unless noted as illustrated in Phase 2 below

---

## SQUAT

| ID | Name | Movement | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| bodyweight-squat | Bodyweight squat | squat | bodyweight-only | reps | side | Bottom of squat, thighs ~parallel, chest up | No equipment; arms extended forward or hands clasped at chest for balance |
| goblet-squat | Goblet squat | squat | dumbbells | reps-weight | 3/4 | Bottom squat, dumbbell held vertically at chest, elbows down between knees | **Illustrated in Phase 2** — matches reference image 1 closely |
| barbell-back-squat | Barbell back squat | squat | barbell | reps-weight | side | Just below parallel, bar racked high across upper back, slight forward torso lean | Show bar resting on traps/rear delts, plates on bar |
| leg-press | Leg press | squat | machine | reps-weight | side | Knees at ~90°, platform loaded, feet flat shoulder-width | Sled/machine frame at 45°, seat back reclined |

## HINGE

| ID | Name | Movement | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| glute-bridge | Glute bridge | hinge | bodyweight-only | reps | side | Top of bridge, hips fully extended, shoulders on floor, knees bent | Straight line torso-to-knee at top |
| dumbbell-rdl | Dumbbell RDL | hinge | dumbbells | reps-weight | side (3/4 acceptable) | Hinge position, dumbbells at knee/upper-shin level, hips pushed back, neutral spine | Same RDL hinge mechanics as barbell-rdl, dumbbell equipment |
| barbell-rdl | Barbell RDL | hinge | barbell | reps-weight | side | Hinge position, bar at knee/upper-shin level, hips pushed back, neutral spine | Differentiated from deadlift by NOT starting from the floor |
| barbell-deadlift | Barbell deadlift | hinge | barbell | reps-weight | side | Dead-stop starting position: bar on the floor, shins vertical, hips higher than knees | Decided 2026-08-16 to visually differentiate from the RDLs — not exaggerated, just the technically distinct dead-stop position |
| hip-thrust | Barbell hip thrust | hinge | barbell, bench | reps-weight | side | Near-top, hips extended, upper back on bench, bar across hips | **Illustrated in Phase 2** |

## LUNGE

| ID | Name | Movement | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| bodyweight-lunge | Bodyweight lunge | lunge | bodyweight-only | reps-side | side | Bottom of lunge, both knees ~90°, torso upright | No equipment |
| dumbbell-reverse-lunge | Dumbbell reverse lunge | lunge | dumbbells | reps-weight-side | side | Bottom of lunge, rear foot stepped back, dumbbells at sides | |
| dumbbell-walking-lunge | Dumbbell walking lunge | lunge | dumbbells | reps-weight-side | side | Bottom of lunge mid-stride, dumbbells at sides | Implies forward travel vs. reverse-lunge's static step-back |
| dumbbell-split-squat | Rear-foot-elevated split squat | lunge | dumbbells, bench | reps-weight-side | side | Bottom position, rear foot elevated on bench behind, front shin vertical | Bench must be visibly behind/low, not confused with step-up's box |
| dumbbell-step-up | Dumbbell step-up | lunge | dumbbells, bench | reps-weight-side | 3/4 | Mid-drive, lead foot planted on box/bench, trailing leg extending upward | **Illustrated in Phase 2** |

## HORIZONTAL PUSH

| ID | Name | Movement | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| push-up | Push-up | horizontal-push | bodyweight-only | reps | side | Bottom position, body straight line, elbows ~45° | |
| dumbbell-bench-press | Dumbbell bench press | horizontal-push | dumbbells, bench | reps-weight | side | Bottom position, dumbbells just above chest, elbows bent | |
| barbell-bench-press | Barbell bench press | horizontal-push | barbell, bench | reps-weight | side | Bottom position, bar at mid-chest, elbows ~45°, feet flat | Mirrors reference image 2 directly |
| machine-chest-press | Machine chest press | horizontal-push | machine | reps-weight | 3/4 | Mid-press, seated, handles partway forward, back on pad | 3/4 to read machine structure |

## HORIZONTAL PULL

| ID | Name | Movement | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| bodyweight-inverted-row | Inverted row | horizontal-pull | bodyweight-only | reps | side | Top of pull, chest near bar/edge, body straight, heels on floor | Needs an implied low bar/table edge |
| band-row | Resistance-band row | horizontal-pull | resistance-bands | reps | 3/4 | End of pull, band pulled to torso, elbows back | Decided 2026-08-16: show a minimal neutral anchor (simple vertical post/bar) — necessary equipment context, not background scenery |
| dumbbell-row | Dumbbell row | horizontal-pull | dumbbells | reps-weight-side | 3/4 | Bottom-mid pull, one knee+hand on bench, dumbbell pulled to hip | Decided 2026-08-16: illustrate with a flat bench per the actual technique text — technique accuracy takes precedence over `equipment` metadata for illustration purposes; the equipment data model itself is NOT being changed |
| barbell-row | Barbell row | horizontal-pull | barbell | reps-weight | side | Hinge position, bar pulled to lower ribs, elbows driving back | |
| seated-cable-row | Seated cable row | horizontal-pull | cable | reps-weight | side | End of pull, handle at torso, chest up, seated at cable stack | |

## VERTICAL PUSH

| ID | Name | Movement | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| pike-push-up | Pike push-up | vertical-push | bodyweight-only | reps | side | Bottom, head lowering toward floor, hips high (pike) | |
| dumbbell-shoulder-press | Dumbbell shoulder press | vertical-push | dumbbells | reps-weight | front | Top-mid press, arms near full extension overhead | Frontal reads bilateral symmetry clearly |
| barbell-overhead-press | Barbell overhead press | vertical-push | barbell | reps-weight | side | Mid-press, bar just above head/eye level, torso braced upright | Side shows bar path close to face |
| machine-shoulder-press | Machine shoulder press | vertical-push | machine | reps-weight | 3/4 | Mid-press, seated, handles partway up | |

## VERTICAL PULL

| ID | Name | Movement | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| pull-up | Pull-up | vertical-pull | pull-up-bar | reps | side | Top position, chin near bar, elbows driven down | |
| lat-pulldown | Lat pulldown | vertical-pull | cable | reps-weight | 3/4 | Bottom of pull, bar at upper chest, seated, thighs secured | 3/4 to show machine + thigh pad |

## ISOLATION — chest (horizontal-adduction)

| ID | Name | Movement | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| dumbbell-chest-fly | Dumbbell chest fly | horizontal-adduction | dumbbells, bench | reps-weight | side | Bottom-stretch, arms wide, slight elbow bend, lying on bench | |
| cable-chest-fly | Cable chest fly | horizontal-adduction | cable | reps-weight | front | Contracted position, handles brought together in front of chest | Front shows both cable lines symmetrically |

## CARRY

| ID | Name | Movement | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| farmers-carry | Farmer's carry | carry | dumbbells | duration-weight | side | Mid-stride walking, dumbbell in each hand, torso upright | |

## CORE

| ID | Name | Movement | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| plank | Plank | core | bodyweight-only | duration | side | Static hold, forearms + toes down, straight body line | |
| dead-bug | Dead bug | core | bodyweight-only | reps-side | side | Mid-rep, one arm overhead + opposite leg extended low, other limbs held at 90° | **Illustrated in Phase 2** — lying on back |
| hanging-knee-raise | Hanging knee raise | core | pull-up-bar | reps | side | Top of raise, knees pulled toward chest, hanging from bar | |
| cable-woodchop | Cable woodchop | core | cable | reps-side | 3/4 | Mid-rotation, handle pulled diagonally across body, torso rotated | |
| side-plank | Side plank | core | bodyweight-only | duration-side | front | Static hold, hips lifted, straight line, top arm reaching to ceiling | "Front" = camera facing the side-lying body directly |
| cable-pallof-press | Cable Pallof press | core | cable | reps-side | front | End of press, arms extended straight out from chest, standing sideways to cable stack | Front shows torso staying square despite side-loaded cable |

## ISOLATION — biceps (elbow-flexion)

| ID | Name | Movement | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| dumbbell-biceps-curl | Dumbbell biceps curl | elbow-flexion | dumbbells | reps-weight | side | Intermediate flexed position (~90° elbow) | Matches reference image 4's profile curl |
| band-biceps-curl | Band biceps curl | elbow-flexion | resistance-bands | reps | side | Mid-curl, standing on band | |
| cable-biceps-curl | Cable biceps curl | elbow-flexion | cable | reps-weight | side | Mid-curl at low pulley, elbows pinned to sides | |

## ISOLATION — triceps (elbow-extension)

| ID | Name | Movement | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| triceps-pushdown | Triceps pushdown | elbow-extension | cable | reps-weight | side | Bottom of pushdown, arms extended down, elbows pinned to sides | High cable pulley |
| dumbbell-overhead-triceps-extension | Dumbbell overhead triceps extension | elbow-extension | dumbbells | reps-weight | side | Bottom-stretch, dumbbell lowered behind head, elbows forward | |
| bench-dip | Bench dip | elbow-extension | bodyweight-only, bench | reps | side | Bottom of dip, hips lowered near bench, elbows ~90°, legs extended | |

## ISOLATION — shoulders (shoulder-abduction)

| ID | Name | Movement | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| dumbbell-lateral-raise | Dumbbell lateral raise | shoulder-abduction | dumbbells | reps-weight | front | Top of raise, arms out to sides at shoulder height | |
| band-lateral-raise | Band lateral raise | shoulder-abduction | resistance-bands | reps | front | Top of raise, standing on band, arms at shoulder height | |

## ISOLATION — rear delts / upper back (horizontal-pull, isolation)

| ID | Name | Movement | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| cable-face-pull | Cable face pull | horizontal-pull | cable | reps-weight | front | End of pull, rope pulled to face, hands separated, elbows out and back | **Illustrated in Phase 2** |

## ISOLATION — quads (knee-extension)

| ID | Name | Movement | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| leg-extension | Leg extension | knee-extension | machine | reps-weight | side | Top of extension, legs straight, seated | |

## ISOLATION — hamstrings (knee-flexion)

| ID | Name | Movement | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| leg-curl | Leg curl | knee-flexion | machine | reps-weight | side | Top of curl, heels toward glutes | Decided 2026-08-16: SEATED leg-curl machine, Technogym-style proportions/construction, no logos/branding |

## ISOLATION — calves (calf-raise)

| ID | Name | Movement | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| bodyweight-calf-raise | Bodyweight calf raise | calf-raise | bodyweight-only | reps | side | Top of raise, up on toes, standing tall | |
| machine-calf-raise | Machine calf raise | calf-raise | machine | reps-weight | side | Top of raise, up on toes | Decided 2026-08-16: STANDING calf-raise machine with shoulder pads, Technogym-style proportions/construction, no logos/branding |

## ISOLATION — glute medius (hip-abduction)

| ID | Name | Movement | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| band-lateral-walk | Band lateral walk | hip-abduction | resistance-bands | reps-side | 3/4 | Mid-step, band above knees, athletic low stance, stepping sideways | |
| machine-hip-abduction | Machine hip abduction | hip-abduction | machine | reps-weight | 3/4 | Open/end position, seated, legs pushed apart against pads | **Illustrated in Phase 2** — Technogym-style machine, no branding |

## WARM-UP / COOL-DOWN

| ID | Name | Category | Equipment | Tracking | Angle | Representative position | Visual notes |
|---|---|---|---|---|---|---|---|
| dynamic-warmup-flow | Dynamic warm-up flow | warmup | bodyweight-only | duration | side | **Open** — decided 2026-08-16 to pick ONE real movement from this exercise's own technique data (not a generic "warming up" pose); exact movement not yet chosen | Technique data cycles through bodyweight squats, leg swings, arm circles, light lunges |
| standing-quad-stretch | Standing quad stretch | cooldown | bodyweight-only | duration-side | side | Static stretch, standing, one foot held behind, pulling heel to glute | |
| hamstring-stretch | Standing hamstring stretch | cooldown | bodyweight-only | duration | side | Static stretch, one heel propped on low surface, hinging forward | |
| upper-body-dynamic-warmup | Upper body dynamic warm-up | warmup | bodyweight-only | duration | side | **Open** — same as dynamic-warmup-flow: pick ONE real movement from its technique data, not yet chosen | Technique data cycles through arm circles, pull-aparts, torso twists |
| cross-body-shoulder-stretch | Cross-body shoulder stretch | cooldown | bodyweight-only | duration-side | front | Static stretch, one arm pulled across chest by the other hand | |

---

## Decisions log (superseding the original Phase 1 flagged issues)

All 6 originally-flagged Phase 1 issues have been resolved except one:

1. **dumbbell-row** — illustrate with a flat bench, following the actual technique text. Technique accuracy takes precedence over `equipment` metadata for illustration purposes only; the equipment data model is NOT being changed.
2. **barbell-deadlift vs. RDLs** — differentiated by the technically meaningful dead-stop floor position (deadlift) vs. the knee/upper-shin hinge position (both RDLs). Not exaggerated poses — technique accuracy remains the priority.
3. **leg-curl** — seated machine, Technogym-style, no branding.
4. **machine-calf-raise** — standing machine with shoulder pads, Technogym-style, no branding.
5. **dynamic-warmup-flow / upper-body-dynamic-warmup** — **still open.** Each illustration must show ONE real movement that exists in that exercise's own technique data — not an invented generic "warming up" pose. The specific movement to illustrate for each has not been chosen yet; needs a decision when Phase 3 reaches these two.
6. **band-row anchor** — show the smallest neutral anchor representation necessary (e.g. a simple vertical post/bar), no gym environment built around it.

No duplicate/near-duplicate exercises beyond the intentionally-separate dumbbell/barbell/machine tiers of the same pattern (squat, RDL, bench press, row, overhead press, shoulder press, chest fly, biceps curl, calf raise, hip abduction) — deliberate, separately-selectable exercises per the code's own comments.

**Totals:** 58 exercises · 6 illustrated (Phase 2, pending visual approval) · 52 not yet started · 1 open decision (warm-up flow representative movements).
