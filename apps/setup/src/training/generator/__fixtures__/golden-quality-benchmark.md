# Golden Plan — quality benchmark (hand-authored, not generated)

**This file is not a generator output.** Every other file in this directory
(`1-*.md` through `5-*.md`) is a real plan produced by `generate-plan.ts` for
a specific onboarding scenario, regenerated whenever the generator changes.
This one is different: a human-designed 3-day plan added 2026-08-16 as a
**minimum quality bar**, not a target output.

## What this is for

The generator does **not** need to reproduce this exact plan, these exact
exercises, or these exact rep ranges. Nothing here should be hardcoded into
the engine, and not every plan the generator makes should look like this —
most won't. What the domain model, exercise library, and generator rules
*must* be able to do is produce a plan with **this level of structure,
balance, and specificity** when the user's profile, goal, and available time
justify it (e.g. an experienced user with a 60+ min session budget and a
muscle/strength goal). Use this as a review reference when evaluating
generator changes: does a rich, time-rich, experienced-user plan still come
out this well-composed, or has some rule capped/flattened it?

## The plan

### Day 1 · Legs + Glutes

| Exercise | Prescription | Target |
| --- | --- | --- |
| Hip Thrust | 3 × 8–10 | Glutes |
| Romanian Deadlift | 3 × 8–10 | Glutes + Hamstrings |
| Goblet Squat | 2 × 8–10 | Legs |
| Reverse Lunge | 2 × 8 / side | Legs + Glutes |
| Leg Curl | 2 × 10–12 | Hamstrings |
| Hip Abduction | 2 × 12–15 | Glutes |
| Dead Bug | 3 × 8 / side | Core |

### Day 2 · Back + Arms + Core

| Exercise | Prescription | Target |
| --- | --- | --- |
| Seated Cable Row | 3 × 8–10 | Back |
| Lat Pulldown | 2 × 8–10 | Lats |
| Face Pull | 2 × 12–15 | Rear Back / Rear Delts |
| Lateral Raise | 2 × 10–12 | Shoulders |
| Biceps Curl | 2 × 10 | Biceps |
| Triceps Pushdown | 2 × 10 | Triceps |
| Pallof Press | 3 × 10 / side | Core |

### Day 3 · Athletic Full Body

| Exercise | Prescription | Target |
| --- | --- | --- |
| Romanian Deadlift | 3 × 8 | Posterior Chain |
| Step-Up | 2 × 8 / leg | Legs + Stability |
| Hip Thrust | 2 × 10 | Glutes |
| Single-Arm Row | 2 × 10 / side | Back |
| Chest Press | 2 × 8–10 | Chest + Arms |
| Farmer Carry | 3 × 30–40 s | Full Body |
| Dead Bug | 2 × 8 / side | Core |

## Qualities this plan demonstrates (the actual review checklist)

1. **Session depth** — 6–7 exercises when time/experience/goal justify it;
   plans shouldn't be artificially capped at 4–5.
2. **Exercise diversity within a session** — primary compound + secondary
   compound + unilateral + isolation/accessory + core + carry/stability,
   not just movement-pattern-slot coverage.
3. **Muscle-specific accessories, deliberately chosen** — leg curl, hip
   abduction, face pull, lateral raise, biceps curl, triceps pushdown are
   not optional filler; they're added because they improve the plan.
4. **Mixed set/rep prescriptions within one session** — 3×8–10, 2×8–10,
   2×12–15, 3×8/side, 3×30–40s all coexist; not every exercise forced into
   the same scheme.
5. **Unilateral support** — both reps+side (Reverse Lunge, Dead Bug) and
   reps+weight+side (Single-Arm Row) need real domain tracking.
6. **Time-based work** — Farmer Carry (3×30–40s) needs a duration model,
   not reps forced onto a carry.
7. **Weekly programming with intentional repeats** — Romanian Deadlift,
   Hip Thrust, and Dead Bug each appear on both Day 1 and Day 3.
   Repetition is used deliberately (progression/learning), not avoided for
   its own sake.
8. **Day intent above movement-pattern-slot-filling** — Day 1 is a
   lower-body/glute-emphasis day, Day 2 is upper-pull + arms + core, Day 3
   is athletic full body. Each day has a distinct purpose, not just "fill
   the remaining patterns."

## Review use

When reviewing a generator change, regenerate a plan for a scenario with
comparable slack (experienced user, 60+ min sessions, muscle/strength goal)
and check it against the 8 qualities above — not against this plan's exact
exercise choices.
