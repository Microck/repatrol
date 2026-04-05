# Nightshift: Test Gap Analysis — repatrol

**Task:** test-gap  
**Category:** analysis  
**Date:** 2025-04-05  

## Summary

Repatrol has **zero unit or integration tests**. The only test-like artifacts are manual smoke scripts (`npm run smoke`, `npm run foundry:smoke`) that launch a real browser and server. There is no test runner, no test framework, no test directory, and no `.test.ts` or `.spec.ts` files anywhere in the repo.

This is a significant gap for a project that automates QA. The codebase has ~556 lines of TypeScript across 5 source files — small enough to achieve high coverage quickly.

---

## Current Testing Landscape

| Artifact | Type | Automated? | CI-integrated? |
|----------|------|------------|----------------|
| `npm run smoke` | Playwright smoke script | Partial (requires browser) | No |
| `npm run foundry:smoke` | Azure Foundry connectivity check | Partial (requires env vars) | No |
| `npm run check` | TypeScript type-check (`tsc --noEmit`) | Yes | No |
| Unit tests | **None** | — | — |
| Integration tests | **None** | — | — |

---

## Gaps by Severity

### P1 — High

#### 1. No tests for `readState()` (orchestrator.ts:22-48)
Core state detection logic with 3 fallback paths. Relies on Playwright `Page` objects, but the branching logic (stateLabel → page text crash detection → h1/title fallback → UNKNOWN) is pure logic that could be tested with a mocked `Page`.

**Risk:** Silent regression in crash detection. If the crash-fallback path breaks, repatrol stops reporting bugs.

**Recommendation:** Extract `readState` into a testable function. Mock `page.locator`, `page.evaluate`, `page.title` to exercise all 4 return paths. ~8 test cases.

#### 2. No tests for coverage calculation (orchestrator.ts:151-167)
The `coveragePercent` calculation uses hardcoded thresholds (`≤1 → 33.3`, `==2 → 66.7`, `else → 100`). This is a business-critical metric that directly affects the run summary output.

**Risk:** If the thresholds change or the `Set` logic breaks, coverage reports become meaningless.

**Recommendation:** Extract coverage calculation into a pure function in `fs-utils.ts` or a new `coverage.ts`. Test with 1, 2, and 3+ unique states.

#### 3. No tests for `renderIssueBody()` (orchestrator.ts:50-75)
Markdown rendering of bug reports. If the template breaks, GitHub issue formatting is garbled.

**Risk:** Low functional risk but high presentation risk.

**Recommendation:** Pure function, trivially testable with a fixture `BugReport` + `CoverageSummary`. ~3 test cases.

### P2 — Medium

#### 4. No tests for `createIssue()` (github.ts:8-33)
GitHub API client. Currently untested — network errors, missing `html_url`, non-OK responses are all unhandled paths.

**Recommendation:** Mock `fetch` with `jest` or `vitest`. Test success, 404, 500, and missing `html_url` cases. ~5 test cases.

#### 5. No tests for path traversal protection (server.ts:19-27)
The `sanitizePath` function prevents directory traversal via `path.resolve` + prefix check. This is a security boundary.

**Risk:** If the sanitization logic regresses, the built-in HTTP server serves arbitrary files.

**Recommendation:** Test with `../etc/passwd`, encoded `..%2F`, double-encoded paths, and normal paths. ~6 test cases.

#### 6. No tests for `ensurePaths()` (orchestrator.ts:77-99)
Creates 5 directories. If the path construction changes, artifacts end up in the wrong place.

**Recommendation:** Use a temp dir. Verify all 5 subdirectories exist after call.

### P3 — Low

#### 7. No tests for `newRunId()` and `nowIso()` (fs-utils.ts)
Utility functions. Low risk but trivially testable.

#### 8. No tests for `startDemoServer()` / `closeServer()` (server.ts)
HTTP server lifecycle. Would require port management in tests.

#### 9. No tests for `checkDemoServer()` (server.ts:78-85)
Simple HTTP check. Would need a running server.

---

## Recommendations

### Priority 1: Add a test framework

```bash
npm install -D vitest
```

Add to `package.json`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

### Priority 2: Test pure functions first

Start with `renderIssueBody`, coverage calculation, `sanitizePath`, and `newRunId`. These have zero external dependencies and cover the most critical logic.

### Priority 3: Mock-dependent tests

Use `vitest` mocking for `createIssue` (mock fetch) and `readState` (mock Playwright Page).

### Priority 4: Add CI integration

Add a GitHub Actions workflow that runs `npm run check && npm test` on every PR.

---

## Testability Score

| Module | Lines | Pure Logic | External Deps | Test Difficulty |
|--------|-------|------------|---------------|-----------------|
| fs-utils.ts | 26 | High | None | Easy |
| github.ts | 33 | Medium | fetch API | Easy (mock) |
| types.ts | 49 | N/A | None | N/A (type defs) |
| server.ts | 85 | Medium | http module | Medium |
| orchestrator.ts | 363 | Medium | Playwright | Medium-High |

**Overall testability:** Good. The small codebase and clear module boundaries make adding tests straightforward. The main complexity is Playwright mocking in orchestrator.ts.
