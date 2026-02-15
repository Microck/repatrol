---
phase: 03-chaos-agent
plan: 03
subsystem: agents
tags: [chaos-agent, adversarial-inputs, bug-capture]
requires:
  - phase: 03-01
    provides: crash/hang detector primitives
  - phase: 03-02
    provides: BugReport and evidence capture contract
  - phase: 01-02
    provides: recording utilities
provides:
  - Chaos agent adversarial execution loop
  - detector wiring to live Playwright page events
  - bug report and evidence output pipeline
affects: [04-reporting, 05-demo-submit]
tech-stack:
  added: []
  patterns: [stop-on-first-bug deterministic run]
key-files:
  created: [src/agents/chaos_agent.py, scripts/run_chaos.py]
  modified: [src/agents/__init__.py, src/detection/crash.py]
key-decisions:
  - Exit with code 2 on bug found so orchestrator can treat detection as success.
  - Finalize recording immediately on detector trigger to preserve reproducible evidence.
patterns-established:
  - "Chaos runs are bounded and artifact-first, not open-ended fuzz loops."
duration: 21min
completed: 2026-02-15
---

# Phase 3 Plan 3: Chaos Agent Integration Summary

**Chaos now performs adversarial gameplay, listens for live crash signals, and emits full bug artifacts.**

## Performance

- **Duration:** 21 min
- **Started:** 2026-02-15T22:37:00Z
- **Completed:** 2026-02-15T22:58:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Added configurable adversarial action set (rapid clicks, random clicks, input spam).
- Wired `CrashDetector.attach(page)` to Playwright page lifecycle events.
- Integrated detection->evidence->BugReport flow with CLI output and deterministic stop.

## Task Commits

1. **Task 1: Implement adversarial action generator** - `177f371` (feat)
2. **Task 2: Attach crash detector to live Playwright events** - `9271add` (feat)
3. **Task 3: Emit bug reports with evidence and runner CLI** - `f568fe2` (feat)

## Files Created/Modified

- `src/agents/chaos_agent.py` - chaos loop and detector integration
- `src/detection/crash.py` - listener attachment helpers
- `scripts/run_chaos.py` - chaos run CLI and exit code semantics

## Decisions Made

- Treat bug detection as successful run completion for demo determinism.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

Reporter phase can consume real bug artifacts and attach evidence references.

## Self-Check: PASSED
