# SetUp

Read [setup-functional-spec.md](./setup-functional-spec.md) before proposing architecture or features for this app. It is the source of truth for product scope, domain architecture, and the phased implementation plan — see its section 19 for standing working rules (don't expand scope without asking, keep training-domain logic independent from UI, ask before product decisions the spec doesn't cover).

## Working mode

Optimize for speed, low token usage, and minimal context.

### Default behavior

- Prefer the smallest possible change.
- Don't inspect the whole repo unless the task genuinely requires it.
- Don't inspect Paper unless the task needs visual info not already known.
- Don't reread product or Design System docs for small implementation changes.
- If a file, component, or feature is named, start there and keep scope local.
- Don't refactor unrelated code or expand scope without a clear reason.
- Don't audit unless explicitly asked.
- Don't generate long implementation reports.

### Small changes

Treat requests like "change a size," "fix spacing," "change copy," "adjust an icon," "fix a state," or "modify existing component" as direct implementation tasks:

1. Inspect only the relevant file(s).
2. Make the minimum change.
3. Verify it.
4. Respond briefly with what changed.

Don't re-analyze the product, Paper, Storybook, or the Design System for these.

### Visual changes

Only inspect Paper when the required visual value or behavior is unknown. If the design decision is already implemented or documented, use the existing code/tokens as the source of truth instead of re-inspecting Paper.

### Larger product work

For features, architecture, data models, plan-generation logic, navigation, or significant refactors, relevant documentation and related files may be inspected — but keep context scoped to the feature being worked on.

### Sources of truth

- Product behavior → functional spec
- Visual design → Paper
- Design foundations/components already defined → code
- Current implementation → repository

Load only the sources needed for the current request, not all of them.

### Communication

For normal implementation tasks, respond only with:
- What changed
- Blockers or decisions needed, if any

No file-by-file reports, token audits, or architectural explanations unless requested. If a decision genuinely needs input, ask before proceeding — otherwise choose the simplest maintainable implementation and continue.
