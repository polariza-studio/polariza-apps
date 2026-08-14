# Safety — training evidence

Status: pending review. No rules encoded yet.

This document should explain the reasoning behind `training/rules/safety.ts` — specifically, how injury, pregnancy, and postpartum contexts (spec §4.1 step 8) should eventually be handled.

**Binding constraint until this document and corresponding rules are reviewed** (spec §4.1 step 8, enforced by `training/rules/safety.ts` and tested in `training/generator/generate-plan.test.ts`): SetUp must not automatically generate a specialized plan for any of these contexts. The generator must produce the same output regardless of which context values are present.

## Open questions for review

- What reviewed programming logic (if any) should exist per context
- Whether any context should block automatic generation entirely rather than silently ignoring it
- Who is qualified to review this content before it becomes non-provisional
