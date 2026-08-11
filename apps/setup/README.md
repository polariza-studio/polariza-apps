# SetUp

A simple app to plan, organize, and track your workouts.

## Why it exists

The first app in the [Polariza Apps](../../README.md) catalog — a small, self-contained example of what the studio builds from idea to shipped product.

## Stack

Vite + React + TypeScript, styled with Tailwind CSS and shadcn/ui (Radix base). Static output, no backend.

## Run it

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build      # outputs to dist/
pnpm preview    # serve the production build locally
```

Deployed automatically to GitHub Pages on push to `main` — see the repo-level [deploy workflow](../../.github/workflows/deploy.yml).
