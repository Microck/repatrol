---
phase: 03-chaos-agent
plan: 01
subsystem: detection
tags: [crash-detection, hang-detection, playwright-signals]
requires:
  - phase: 02-01
    provides: GameState model and state stream
provides:
  - Crash detector for page errors and fatal signals
  - Hang detector for repeated/loading-stuck states
affects: [03-03, 05-demo-submit]
tech-stack:
  added: []
  patterns: [observe-check detector lifecycle]
key-files:
  created: [src/detection/crash.py, src/detection/hang.py, scripts/detection_smoke.py]
  modified: [src/detection/__init__.py]
key-decisions:
  - Keep detector API tiny (`observe` + `check`) to simplify agent integration.
  - Combine event-driven crash signals with state-driven hang signals.
patterns-established:
  - "Failure detection is explicit and queryable on every loop iteration."
duration: 13min
completed: 2026-02-15
---

# Phase 3 Plan 1: Failure Detection Primitives Summary

**Crash and hang signals are now detectable through stable detector APIs and offline smoke scenarios.**

## Performance

- **Duration:** 13 min
- **Started:** 2026-02-15T22:13:00Z
- **Completed:** 2026-02-15T22:26:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Implemented `CrashDetector` for fatal Playwright/page signals.
- Implemented `HangDetector` for repeated-state and loading timeout detection.
- Added offline detector smoke harness for deterministic validation.

## Task Commits

1. **Task 1: Create crash and hang detector implementations** - `536e8f5` (feat)
2. **Task 2: Add mocked detector smoke scenarios** - `cd12cd7` (feat)

## Files Created/Modified

- `src/detection/crash.py` - crash signal aggregation
- `src/detection/hang.py` - hang heuristics
- `scripts/detection_smoke.py` - offline detector test script

## Decisions Made

- Keep detector smoke fully offline for fast repeatable checks in CI/local runs.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

Chaos can now trigger bug capture only when detector reasons are present.

## Self-Check: PASSED
