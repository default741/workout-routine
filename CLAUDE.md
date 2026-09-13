# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm install
npm run dev      # dev server; app is served under basePath, open http://localhost:3000/workout-routine/
npm run build    # static export to ./out (output: "export" in next.config.ts)
npm run lint     # eslint
```

There is no test suite configured in this repo.

## Architecture

This is a static (fully client-rendered) Next.js app — no server, no API routes, no database. All state lives in the browser's `localStorage`, keyed per profile.

**Two hard-coded profiles ("people"), not user accounts.** `data/abdemanaaf.json` and `data/dad.json` (typed via `types/workout.ts`, loaded through `data/index.ts`) define each person's routine: a list of `Day`s, each with `Section`s of `Exercise`s. Abdemanaaf's routine has a `rotation` (auto-advances to the next day in sequence after finishing a workout); Dad's routine has none and instead maps to fixed weekdays, falling back to a rest-day view (see `lib/rotation.ts`, `lib/weekday.ts`, `RestDayCard.tsx`). These JSON files were transcribed from the spreadsheets in `docs/` — if routine content needs to change, prefer editing the spreadsheet-derived JSON to match, not inventing new exercises.

**State model** (`types/workout.ts`): for each exercise, there's an in-progress `ExerciseDraft` (checkbox + editable sets) and an archived `ExerciseHistoryRecord` (newest-first array of past sessions, one entry per completed day). Finishing a workout (`lib/history.ts` `commitDayToHistory`, invoked from `WorkoutApp.handleFinishWorkout`) is the single transition point that moves non-empty draft sets into history and resets the draft. That handler deliberately re-reads localStorage synchronously (`readJSON`) rather than trusting React state, since it touches two keys (draft + history) that must commit together.

**Storage keys** are namespaced per profile via `lib/storageKeys.ts` (`wt:<profile>:draft`, `wt:<profile>:history`, etc.) plus one global `wt:selectedProfile`. `lib/useLocalStorage.ts` is the hook wrapping reads/writes; profile-scoped state explicitly does *not* sync across browser tabs (see comment in `WorkoutApp.tsx`) so two people using the app on the same device in separate tabs don't clobber each other's selected profile mid-workout.

**Export/Import** (`lib/exportImport.ts`) serializes all profiles' storage into one versioned JSON blob (`SCHEMA_VERSION`) for backup/device transfer. Bump `SCHEMA_VERSION` and add a migration path if the storage shape changes; old exports are rejected outright rather than silently upgraded. `lib/history.ts`'s `pruneHistoryRecord` is applied on import to bound stored history size.

**Deployment**: pushing to `main` triggers `.github/workflows/nextjs.yml`, which runs `next build` (static export) and publishes to GitHub Pages. The `basePath`/`assetPrefix` of `/workout-routine` in `next.config.ts` must stay in sync with the GitHub Pages URL path.
