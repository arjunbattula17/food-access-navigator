# Food Access Navigator — Houston Food Bank (demo)

An AI-powered food-access navigation prototype: given a person's real-world
situation — location, household size, transportation, available time, and
accessibility needs — it recommends the most reachable, appropriate
food-assistance location and explains why in plain language.

This is a hackathon/demo build. **All location names, hours, wait times,
capacity and food inventory are simulated demo data — not real Houston Food
Bank operational data.**

## How the recommendation engine works

There is no external AI API call. Recommendations come from a deterministic,
explainable scoring engine (`src/engine/recommend.ts`) so results are
reproducible and every score can be traced back to a reason:

- **Hard constraints** (make a location ineligible, not just lower-scored):
  closed during the requested time window, a required accessibility need is
  unmet, household size exceeds capacity, the specific food category needed
  is unavailable, or the location is genuinely unreachable with no
  transportation.
- **Weighted scoring** (100 pts) across eligible locations: transportation
  fit (30), hours overlap (20), wait time (15), distance (15), food
  availability (10), accessibility (10).
- Every recommendation includes a factor-by-factor breakdown and a
  human-readable explanation generated from the actual scoring inputs.

The **⚡ Simulate Emergency** control mutates the location dataset live (a
site closes, wait times spike, a new site opens) and the engine
re-recommends instantly — no page reload, no hardcoded "if emergency then
recommend X" — it re-runs the same scoring function against new data.

## Running locally

```bash
npm install
npm run dev       # http://localhost:5173
```

## Build

```bash
npm run build      # type-checks with tsc -b, then builds with vite
npm run preview    # serve the production build locally
```

## Deploying to Render

This repo includes `render.yaml` (a Render Blueprint) configured as a static
site:

1. Push this repo to GitHub.
2. In the Render dashboard, choose **New → Blueprint**, and point it at this
   repo. Render will read `render.yaml` and provision a static site with:
   - Build command: `npm ci && npm run build`
   - Publish directory: `dist`
   - SPA rewrite: all routes → `/index.html`
3. Deploy. No environment variables or backend services are required — this
   is a fully client-side app.

Alternatively, create the static site manually in the Render dashboard with
the same build command and publish directory.
