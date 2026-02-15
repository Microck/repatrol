---
phase: 01-foundation
plan: 04
subsystem: demo-target
tags: [web-game, deterministic-bug, local-server]
requires:
  - phase: 01-foundation
    provides: baseline project structure
provides:
  - intentionally buggy local web game with deterministic crash path
  - non-interactive server health check command
affects: [01-01, 02-explorer-agent, 03-chaos-agent, 05-demo-submit]
tech-stack:
  added: []
  patterns: [static deterministic test target]
key-files:
  created: [demo/buggy_web_game/index.html, demo/buggy_web_game/game.js, demo/buggy_web_game/README.md, scripts/serve_buggy_web_game.py]
  modified: []
key-decisions:
  - Build an in-repo static game target to avoid dependency on external sites.
  - Encode a deterministic crash sequence for repeatable detector validation.
patterns-established:
  - "Every demo path should be reproducible via documented button sequence."
duration: 16min
completed: 2026-02-15
---

# Phase 1 Plan 4: Deterministic Buggy Game Target Summary

**A local static web game with explicit state labels and a reproducible uncaught-error bug trigger.**

## Performance

- **Duration:** 16 min
- **Started:** 2026-02-15T21:04:00Z
- **Completed:** 2026-02-15T21:20:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Added in-repo buggy web game with clear TITLE/PLAY/CRASH state labels.
- Documented deterministic crash path (`START -> BOOST x7 -> FIRE`).
- Added `serve_buggy_web_game.py --check` for non-interactive availability verification.

## Task Commits

1. **Task 1: Create buggy demo game and crash path** - `f2d62eb` (feat)
2. **Task 2: Add local server script with self-check** - `48c0bc8` (feat)

## Files Created/Modified

- `demo/buggy_web_game/index.html` - target game entry point
- `demo/buggy_web_game/game.js` - deterministic bug logic
- `demo/buggy_web_game/README.md` - trigger and serving instructions
- `scripts/serve_buggy_web_game.py` - local host/check utility

## Decisions Made

- Keep target game static (no build step) for reliability.
- Use stdlib HTTP server for simple local serving.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

Foundation is complete; Explorer and Chaos can run entirely against a deterministic local target.

## Self-Check: PASSED
