---
phase: 03-chaos-agent
plan: 02
subsystem: models
tags: [bug-report, evidence, serialization]
requires:
  - phase: 02-01
    provides: GameState schema
  - phase: 02-03
    provides: RunContext shared paths
provides:
  - canonical BugReport model with JSON persistence
  - evidence capture helper for screenshot/state/video pointers
affects: [03-03, 04-reporting, 05-demo-submit]
tech-stack:
  added: []
  patterns: [structured bug artifact contract]
key-files:
  created: [src/models/bug.py, src/evidence/capture.py, scripts/bug_model_smoke.py]
  modified: [src/models/__init__.py, src/evidence/__init__.py]
key-decisions:
  - Store reproducibility data in one canonical JSON bug artifact.
  - Keep `video_path` nullable to support runs without recording.
patterns-established:
  - "Reporter and orchestrator consume BugReport JSON, not ad-hoc logs."
duration: 11min
completed: 2026-02-15
---

# Phase 3 Plan 2: Bug Artifact Contract Summary

**Bug detection now produces durable `BugReport` JSON bundles with evidence and repro context.**

## Performance

- **Duration:** 11 min
- **Started:** 2026-02-15T22:26:00Z
- **Completed:** 2026-02-15T22:37:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Implemented bug model with deterministic save/load helpers.
- Added evidence capture helper to persist screenshot and state snapshots.
- Added smoke runner proving round-trip schema integrity.

## Task Commits

1. **Task 1: Implement BugReport model + JSON persistence** - `9c3bed1` (feat)
2. **Task 2: Add evidence capture helper + smoke runner** - `51cc850` (feat)

## Files Created/Modified

- `src/models/bug.py` - bug artifact schema and persistence
- `src/evidence/capture.py` - evidence capture utility
- `scripts/bug_model_smoke.py` - bug round-trip smoke script

## Decisions Made

- Preserve detector reason and repro steps directly in stored bug artifacts.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

Chaos can now emit reporter-ready bug files when failures are detected.

## Self-Check: PASSED
