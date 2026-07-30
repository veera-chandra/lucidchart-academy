# Autonomous content maintainer

This project has a scheduled Claude Code agent that runs on its own (no
human triggers each run) to keep the lesson content fresh. This file is
the brief that routine reads every time it runs.

## Scope — what it may touch

- `content/lessons.json` — wording, clarity, accuracy, small structural
  fixes (e.g. splitting an overloaded section).
- `content/quiz.json` — fixing ambiguous questions/answers, adding at
  most one new question per run.
- `MAINTENANCE_LOG.md` — append exactly one line per run (see below).

## Out of bounds — what it must not touch

- `index.html`, `css/style.css`, `js/app.js`, `js/canvas.js` — the app
  shell and the practice-canvas logic are not content and should not
  change without a human asking.
- `package.json`, `README.md`, this file.
- Course scope: stays "LucidChart basics" (interface tour, shapes,
  connectors, basic flowcharts, recap quiz). Don't add intermediate/
  advanced topics (ER diagrams, swimlanes, integrations) — that's a
  deliberate scoping decision, not an oversight.

## What a run should do

1. Read `content/lessons.json` and `content/quiz.json` in full.
2. Look for: factual drift (LucidChart UI/feature changes), unclear
   wording, typos, a quiz question that doesn't match its answer index,
   or a lesson section that's noticeably thin compared to its peers.
3. Make small, targeted edits directly to the JSON files. Keep the
   existing tone and length — this is a light touch-up pass, not a
   rewrite.
4. Regardless of whether content needed changing, append exactly one line
   to `MAINTENANCE_LOG.md` in the format:
   `- 2026-07-30: <what you changed, or "no changes needed">`
   (use the actual current UTC date). This is the one file you always
   touch, every run — it's what makes each run's execution verifiable.
5. If content edits were made, commit them with a message describing what
   changed and why (e.g. "Clarify connector labeling example in
   Lesson 4"). Never force-push or rewrite history.
6. Commit the `MAINTENANCE_LOG.md` line — either together with any content
   edits in one commit, or on its own if nothing else changed (message
   like "Maintenance check: no changes needed"). Then push to `origin
   main`. GitHub Pages rebuilds from `main` automatically, so anything
   pushed here goes live on the public site with no further action.

## Validation before committing

- Both JSON files must still be valid JSON.
- `lessons.json` must keep exactly the same lesson `id`s in the same
  order (the app's progress-tracking in `js/app.js` keys off these ids
  via localStorage — renaming or reordering breaks existing users'
  saved progress).
- `quiz.json` entries must each keep `answer` as a valid index into
  their own `options` array.

## How this actually runs today

This repo lives at https://github.com/veera-chandra/lucidchart-academy
and is served publicly via GitHub Pages at
https://veera-chandra.github.io/lucidchart-academy/ (rebuilds
automatically on every push to `main`).

A durable **cloud routine** (id `trig_014zeopvFaDks7M5fDRH6B8p`, named
"LucidChart Academy content maintainer") runs this exact brief every
Thursday at 9:12am America/Chicago, independent of any local machine or
Claude session — it clones this repo fresh each run, follows this file,
and pushes any edits straight to `main`, which goes live on Pages
automatically. You can also trigger an off-schedule run any time from
claude.ai/code/routines.
