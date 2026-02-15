---
phase: 01-foundation
plan: 03
subsystem: llm
tags: [foundry, azure-openai, config-validation]
requires:
  - phase: 01-foundation
    provides: baseline project scaffold and scripts
provides:
  - Foundry config artifacts (json source + yaml mirror)
  - LLM client interface and Foundry-backed implementation with mock mode
affects: [02-explorer-agent, 04-reporting]
tech-stack:
  added: []
  patterns: [env-driven secrets, provider abstraction via interface]
key-files:
  created: [infra/foundry_config.json, infra/foundry_config.yaml, scripts/foundry_setup_smoke.py]
  modified: [src/llm/client.py, src/llm/foundry_client.py, src/llm/__init__.py, scripts/validate_foundry_config.py]
key-decisions:
  - Keep secrets out of config files and load exclusively from environment.
  - Support `FOUNDRY_MOCK=1` to keep development offline by default.
patterns-established:
  - "LLM consumers depend on `LLMClient`, never provider-specific calls."
duration: 20min
completed: 2026-02-15
---

# Phase 1 Plan 3: Foundry Config and Client Surface Summary

**Validated Foundry configuration plus an interface-first LLM client with mock and live paths.**

## Performance

- **Duration:** 20 min
- **Started:** 2026-02-15T20:44:00Z
- **Completed:** 2026-02-15T21:04:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Added strict config artifacts and validation tooling for Foundry settings.
- Added setup smoke gate that verifies env vars and performs a single low-cost live request when configured.
- Implemented `LLMClient`/`FoundryLLMClient` abstraction with deterministic mock responses.

## Task Commits

1. **Task 1: Add Foundry config artifacts + validator/smoke** - `93ec530` (feat)
2. **Task 2: Implement LLM interface + Foundry client scaffold** - `4016cf3` (feat)

## Files Created/Modified

- `infra/foundry_config.json` - canonical Foundry config shape
- `infra/foundry_config.yaml` - required mirror artifact
- `scripts/validate_foundry_config.py` - config schema checks
- `scripts/foundry_setup_smoke.py` - environment/live-call gate
- `src/llm/foundry_client.py` - mock/live Foundry client behavior

## Decisions Made

- Prefer stdlib HTTP calls to minimize dependencies in baseline infrastructure.
- Fail fast with copy-paste export guidance when env vars are missing.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Live Foundry smoke remains credential-gated in local verification when env vars are not provided.

## User Setup Required

Set `FOUNDRY_ENDPOINT`, `FOUNDRY_DEPLOYMENT`, `FOUNDRY_API_VERSION`, and `FOUNDRY_API_KEY` to run live Foundry smoke.

## Next Phase Readiness

Explorer vision path can now run in mock mode offline and switch to live Foundry without code changes.

## Self-Check: PASSED
