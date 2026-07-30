# LucidChart Academy

A small interactive portal that teaches LucidChart basics: the editor interface,
core shapes, connectors, and building a basic flowchart — finished off with a
hands-on practice canvas and a recap quiz.

**Live:** https://veera-chandra.github.io/lucidchart-academy/ — public, no
account needed. Hosted on GitHub Pages, rebuilding automatically from `main`.

## Running it locally

```
python3 -m http.server 4173
```

(or `npm start`, which just wraps the same command). This serves the site at
http://localhost:4173 — the app is static, but content is fetched via
`fetch()`, so it must be served over http, not opened as a `file://` URL.

## Structure

- `index.html`, `css/style.css` — shell and styling
- `js/app.js` — lesson navigation, progress tracking (localStorage), quiz rendering
- `js/canvas.js` — the interactive SVG practice canvas (place shapes, draw connectors)
- `content/lessons.json` — all lesson text, edited independently of the app code
- `content/quiz.json` — recap quiz questions

## Autonomous content maintainer

This repo has an autonomous maintainer (brief in `AGENT.md`) that reviews
`content/lessons.json` and `content/quiz.json` for clarity, accuracy, and
gaps, and pushes small improvements straight to `main` — which goes live on
Pages automatically. It intentionally only touches the `content/` directory,
`MAINTENANCE_LOG.md`, and lesson-plan scope — it does not restructure the app
or expand beyond "LucidChart basics" without being asked.

Two mechanisms run this brief on a schedule: a cloud routine (currently
unconfirmed — see `AGENT.md` for why) and a session-bound local cron job
(confirmed working, but only lives as long as its Claude session, max 7
days). See `AGENT.md` for the full, current status of both, and
`MAINTENANCE_LOG.md` for a running record of what each pass actually did.
