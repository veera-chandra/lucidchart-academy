# Autonomous content maintainer

This project has a scheduled Claude Code agent that runs on its own (no
human triggers each run) to keep the lesson content fresh. This file is
the brief that routine reads every time it runs.

## Scope — what it may touch

- `content/lessons.json` — wording, clarity, accuracy, small structural
  fixes (e.g. splitting an overloaded section).
- `content/quiz.json` — fixing ambiguous questions/answers, adding at
  most one new question per run.

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
4. If nothing needs changing, make no edits and no commit.
5. If edits were made, commit them with a message describing what
   changed and why (e.g. "Clarify connector labeling example in
   Lesson 4"). Never force-push or rewrite history.

## Validation before committing

- Both JSON files must still be valid JSON.
- `lessons.json` must keep exactly the same lesson `id`s in the same
  order (the app's progress-tracking in `js/app.js` keys off these ids
  via localStorage — renaming or reordering breaks existing users'
  saved progress).
- `quiz.json` entries must each keep `answer` as a valid index into
  their own `options` array.

## How this actually runs today

There's no GitHub remote and no GitHub auth configured on this machine,
so a durable cloud routine isn't wired up yet. What's in place instead:
a `CronCreate` job (in the Claude Code session that built this project)
firing every Thursday ~9:12am local, running this exact brief. That job
is **session-scoped** — it stops if that Claude session ends, and
auto-expires after 7 days regardless.

To get real "runs forever, no human involved" automation, do one of:

- Push this repo to a GitHub repo you control, then ask Claude Code to
  set up a scheduled **cloud routine** (`/schedule`) pointed at it —
  that runs independent of any local session.
- Or install the `claude` CLI locally and wire this prompt into a
  `launchd`/`cron` job on this Mac that invokes it weekly.

Until either of those is set up, you can always trigger a maintenance
pass on demand by asking Claude Code to "run the LucidChart Academy
content maintainer" from this repo.
