# Workout Tracker

A small workout tracker for two routines:

- **Abdemanaaf** — Push/Pull/Legs, 6 days a week (auto-suggests the next day in rotation once you finish a workout, but you can pick any day manually).
- **Dad** — 3 days a week (Monday/Wednesday/Friday), with a rest-day view on other days.

Logged weight/reps/duration is remembered per exercise (most recent value only, no history) in the browser's `localStorage`. Use the Export/Import links in the header to back up or move that data between devices.

Routine content in `data/abdemanaaf.json` and `data/dad.json` was transcribed from the source spreadsheets in `docs/`.

## Development

```bash
npm install
npm run dev
```

The app is served under `/workout-routine` (see `basePath` in `next.config.ts`), so open `http://localhost:3000/workout-routine/`.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages. One-time setup: in the repo's **Settings → Pages**, set **Source** to **GitHub Actions**. The site will then be available at `https://<username>.github.io/workout-routine/`.
