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

Two mechanisms are wired up, with different confidence levels:

- A **cloud routine** (id `trig_014zeopvFaDks7M5fDRH6B8p`) is scheduled
  for every Thursday at 9:12am America/Chicago and clones this repo
  fresh each run. Two manual test-fires produced no commit at all, even
  when explicitly required to push at least a `MAINTENANCE_LOG.md`
  line — strongly suggesting that cloud environment doesn't actually
  have push credentials for this repo (a separate authorization step
  from any local `gh auth login`, and possibly related to this
  account's Claude Code Web feature being restricted by org policy).
  It's left enabled since it's harmless and may start working if that
  gets resolved, but don't assume it's running until you see it
  actually land a commit.
- A **session-bound local cron job** (via `CronCreate`, same schedule)
  is the mechanism actually confirmed working: on 2026-07-30 it (well,
  a manual run of this exact brief) reviewed both content files and
  pushed a real commit (`c95d877`) that went live on Pages within
  seconds. Its limitation is lifespan, not capability — it only runs
  while its originating Claude session stays open, and auto-expires
  after 7 days regardless. It needs to be re-created (ask Claude Code
  to re-read this file and re-run the `CronCreate` call) whenever that
  session ends.
