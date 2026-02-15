---
phase: 04-reporting
plan: 02
subsystem: integrations
tags: [github-api, issue-template, release-assets]
requires:
  - phase: 04-01
    provides: evidence abstraction and refs
  - phase: 03-02
    provides: BugReport schema
provides:
  - GitHub REST client with dry-run and live modes
  - optional release-asset evidence publisher
  - bug-to-issue smoke renderer with video reference checks
affects: [04-03, 05-demo-submit]
tech-stack:
  added: []
  patterns: [stdlib REST integration, deterministic dry-run]
key-files:
  created: [src/integrations/github.py, scripts/github_issue_smoke.py]
  modified: [src/storage/evidence.py, scripts/evidence_smoke.py, src/integrations/__init__.py]
key-decisions:
  - Implement GitHub calls via stdlib `urllib.request` to keep dependency footprint low.
  - Make dry-run first-class so local development never requires a token.
patterns-established:
  - "Issue body rendering always includes Evidence section with URL fallback to local path."
duration: 22min
completed: 2026-02-15
---

# Phase 4 Plan 2: GitHub Reporting Integration Summary

**Bug artifacts can now render into stable GitHub issue payloads with local or release-hosted evidence links.**

## Performance

- **Duration:** 22 min
- **Started:** 2026-02-15T23:07:00Z
- **Completed:** 2026-02-15T23:29:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Added `GitHubIssueClient` for issues/comments/releases/assets with dry-run mode.
- Added `GitHubReleaseEvidenceStore` that can publish assets and return URL refs.
- Added smoke flow proving rendered issue body references video evidence when present.

## Task Commits

1. **Task 1: Implement GitHub REST client with dry-run support** - `a06fe6e` (feat)
2. **Task 2: Add GitHub release evidence store mode** - `18b94db` (feat)
3. **Task 3: Add bug-to-issue smoke runner with video checks** - `8c4c1b2` (feat)

## Files Created/Modified

- `src/integrations/github.py` - GitHub API wrapper
- `src/storage/evidence.py` - release-backed evidence store
- `scripts/evidence_smoke.py` - local + github-release modes
- `scripts/github_issue_smoke.py` - issue render/create smoke runner

## Decisions Made

- Favor deterministic markdown templates over prompt-only generation for issue reliability.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Live GitHub create/upload remains credential-gated when `GITHUB_TOKEN` and `GITHUB_REPO` are absent.

## User Setup Required

Set `GITHUB_TOKEN` and `GITHUB_REPO` for live issue and asset publishing.

## Next Phase Readiness

Reporter agent can now publish bug findings in dry-run or live GitHub modes.

## Self-Check: PASSED
