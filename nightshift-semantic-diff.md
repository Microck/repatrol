# Nightshift Semantic Diff Report

**Repository:** repatrol  
**Analysis Date:** 2026-04-02  
**Commit Range:** `c1238ed..d7f408e` (most recent 20 commits)  
**First commit in repo:** `0cf0f25` (2026-02-15)  
**Latest commit:** `d7f408e` (2026-03-09)

---

## Commit Summary Table

| # | Hash (short) | Date | Type | Summary |
|---|---|---|---|---|
| 1 | `d7f408e` | 2026-03-09 | **feat** | Updated demo for Skyboost with dynamic bug reporting and asciinema terminal flow |
| 2 | `2225aac` | 2026-03-01 | **ci** | Add GitHub Actions workflow |
| 3 | `04cd975` | 2026-03-01 | docs | Update README.md |
| 4 | `28ef0cf` | 2026-03-01 | docs | Explain naming etymology in README |
| 5 | `1fe9c6c` | 2026-03-01 | docs | Add demo voiceover and test checklist |
| 6 | `bbeeed6` | 2026-03-01 | chore | Remove internal demo docs |
| 7 | `6c5a49e` | 2026-02-28 | chore | Remove `.planning` scaffolding and draft files |
| 8 | `47f1c46` | 2026-02-28 | docs | Remove em-dashes and polish prose in README |
| 9 | `46f7544` | 2026-02-28 | docs | Add polished README, `.gitignore`, and repo metadata |
| 10 | `96f3a1c` | 2026-02-21 | docs | Swap main and accent for dark logo variants |
| 11 | `0a638e8` | 2026-02-21 | docs | Add README logo header and light/dark assets |
| 12 | `d0d4a30` | 2026-02-21 | docs | Tailor logo prompts to game QA artifacts |
| 13 | `2696ac5` | 2026-02-21 | docs | Add distinctive color palettes to logo prompts |
| 14 | `749de5b` | 2026-02-21 | docs | Overwrite README with top-readme skeleton |
| 15 | `b1c3be4` | 2026-02-21 | docs | Apply top-readme outline |
| 16 | `29d3577` | 2026-02-16 | docs | Restructure README for OSS repo format |
| 17 | `483c4cf` | 2026-02-16 | docs | Make README judge-first and add Apache-2.0 license |
| 18 | `2e3c010` | 2026-02-16 | **feat** | Migrate repatrol to TypeScript + Playwright |
| 19 | `c1238ed` | 2026-02-16 | chore | Rename replayrig to repatrol (rebrand) |
| 20 | `e6d48b3` | 2026-02-15 | docs | Require human-recorded submission video |

---

## Semantic Change Analysis

### 1. `2e3c010` — Full-Stack Migration from Python to TypeScript + Playwright

**Scope:** 70 files changed, +1,493 / −3,201 lines  
**Impact:** 🔴 **Breaking / Foundation Rewrite**

This is the most architecturally significant commit in the repository's history. The entire Python codebase was replaced with a TypeScript + Playwright stack.

**What changed semantically:**

- **Language & Runtime:** The project moved from Python (with `requirements.txt`, individual `.py` modules) to TypeScript (ESM modules, `tsconfig.json`, `tsx` for execution). This fundamentally changed the dependency graph, module system, and development workflow.
- **Agent Architecture Consolidation:** The Python version had separate agent modules (`explorer_agent.py`, `chaos_agent.py`, `reporter_agent.py`) organized in an `src/agents/` directory with distinct responsibilities. The TypeScript rewrite collapsed all agent logic into a single `src/orchestrator.ts` file, moving from a multi-agent pattern to a monolithic orchestration pattern.
- **Browser Automation:** Replaced Selenium/Playwright Python bindings with Playwright for Node.js. The new `runOrchestration()` function directly manages browser lifecycle.
- **LLM Integration Removed:** The Python version had a sophisticated Foundry LLM client (`foundry_client.py`, `foundry_vision.py`) for AI-powered game state analysis. The TypeScript version removed all LLM integration — game state detection is now purely DOM-based (reading `#stateLabel`, falling back to `h1` or page title).
- **Script System Simplified:** 15+ Python scripts (smoke tests, demo runners, chaos runners) were consolidated into 4 TypeScript scripts (`run-demo.ts`, `run-smoke.ts`, `serve-buggy-web-game.ts`, `foundry-llm-smoke.ts`).
- **Storage & Evidence:** The Python version had separate storage modules (`coverage_store.py`, `evidence.py`) with richer abstractions. The TypeScript version uses simple JSON file writes via a lightweight `fs-utils.ts` helper.
- **GitHub Integration:** Moved from a full `github.py` integration module (230 lines with label management, duplicate detection) to a minimal `github.ts` wrapper (~33 lines) that only creates issues.

**Semantic implication:** The project pivoted from a research-grade AI QA tool with LLM vision capabilities to a focused, lightweight browser automation tool. The trade-off was depth for simplicity and reliability.

---

### 2. `d7f408e` — Dynamic Bug Reporting & Generic Explorer

**Scope:** 26 files changed, +7,900 / −60 lines  
**Impact:** 🟡 **Feature Enhancement / Behavioral Change**

**What changed semantically:**

- **Explorer Agent Made Generic:** The hardcoded action sequence (`click START`, `click BOOST`, `click BACK`, etc.) was replaced with a **dynamic button discovery** approach. The explorer now finds all `button, [role='button']` elements on the page and clicks them in round-robin order. This is a fundamental shift from a single-game QA tool to a **general-purpose web app testing tool**.
  - Old: 6 hardcoded actions with specific CSS selectors (`#startBtn`, `#boostBtn`, etc.)
  - New: Dynamic `page.locator("button, [role='button']")` discovery with modulo iteration
- **State Detection Hardened:** `readState()` was significantly enhanced with a multi-tier fallback chain:
  1. Try `#stateLabel` with a 500ms timeout
  2. Scan page text for crash keywords (`application error`, `crash`, `unhandled exception`)
  3. Fall back to first `<h1>` content
  4. Fall back to `<title>` content
  5. Return `"UNKNOWN"` as last resort
- **Coverage Calculation Simplified:** Removed hardcoded `knownStates = ["TITLE", "PLAY", "CRASH"]` and replaced with a tiered heuristic: 1 state = 33.3%, 2 states = 66.7%, 3+ = 100%. This makes coverage reporting applicable to any web app rather than a specific game.
- **Demo Infrastructure Expanded:** Added `demo/testweb/` (a full React+TypeScript+Vite app called "SkyBoost") and `demo/real-world-app/` (a JSX app), plus an asciinema terminal recording (`terminal_demo.cast`) and a shell script to replay it. This represents a shift toward self-contained, reproducible demos.
- **Force-Click Tolerance:** Button clicks now use `{ force: true }` and `catch(() => undefined)`, making the explorer resilient to overlapping elements, animations, and transient DOM states.

**Semantic implication:** repatrol evolved from being tightly coupled to a single "buggy web game" to being a generic web application QA tool that can test any page with buttons.

---

### 3. `2225aac` — GitHub Actions CI Pipeline

**Scope:** 1 file, +26 lines  
**Impact:** 🟢 **Infrastructure / Quality Assurance**

**What changed semantically:**

- Introduced a complete CI pipeline: checkout → Node.js 20 setup → `npm ci` → Playwright chromium install → build (`tsc`) → type check (`tsc --noEmit`).
- Triggers on pushes to `main` and PRs to `main`, establishing a gate for code quality.
- This commit represents the project reaching a maturity threshold where automated verification is needed.

---

### 4. `46f7544` — Polished README & Repository Metadata

**Scope:** 2 files, +367 / −93 lines  
**Impact:** 🟢 **Documentation / Presentation**

**What changed semantically:**

- The README was transformed from a rough project description into a polished, comprehensive open-source project page with badges, installation instructions, usage examples, and architecture descriptions.
- The `.gitignore` was updated to properly exclude Node.js artifacts, Playwright output, and build directories — reflecting the new TypeScript stack.

---

### 5. `6c5a49e` — Remove `.planning` Scaffolding

**Scope:** 39 files, −4,144 lines  
**Impact:** 🟢 **Cleanup / Project Maturation**

**What changed semantically:**

- Removed the entire `.planning/` directory containing 36+ planning documents (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md, and phase-specific PLAN/SUMMARY files for phases 01-05).
- Also removed `LOGO.md` and `README_OUTLINE.md` — intermediate scaffolding artifacts.
- This signals the project transitioning from a planning-heavy process to an execution-focused state. The planning documents served their purpose during development and are no longer needed in the repository.

---

### 6. `c1238ed` — Rebrand from "replayrig" to "repatrol"

**Scope:** 11 files, +14 / −14 lines  
**Impact:** 🟢 **Identity / Naming**

**What changed semantically:**

- A straightforward find-and-replace of the project name across documentation, scripts, and source code.
- The name "replayrig" (suggesting replay-based testing) was replaced with "repatrol" (suggesting patrol/monitoring-based testing), aligning the identity with the tool's actual behavior — it patrols web applications looking for bugs.

---

### 7. `483c4cf` — Judge-First README & Apache-2.0 License

**Scope:** 2 files, +225 / −27 lines  
**Impact:** 🟢 **Legal / Open Source Readiness**

**What changed semantically:**

- Added the Apache-2.0 license, formally open-sourcing the project.
- README was restructured to be "judge-first" — prioritizing information that a hackathon judge or evaluator would want to see immediately.

---

### 8. Logo & Visual Identity Commits (`2696ac5` → `96f3a1c`, 5 commits)

**Scope:** ~5 commits, logo prompts + assets  
**Impact:** 🟢 **Branding**

These commits iteratively developed the project's visual identity:
1. Defined color palettes for logo generation
2. Tailored prompts to game QA artifacts
3. Added light/dark logo variants
4. Added logo header to README
5. Swapped main/accent colors for dark variant

---

### 9. Documentation Polish Commits (`04cd975`, `28ef0cf`, `47f1c46`, `1fe9c6c`, `bbeeed6`)

**Scope:** README refinements, demo docs  
**Impact:** 🟢 **Documentation**

- Etymology explanation added (why the name "repatrol")
- Em-dashes removed for prose consistency
- Demo voiceover script and test checklist added
- Internal demo checklists/scripts removed (replaced by public-facing voiceover)

---

## Impact Assessment

### 🔴 Breaking Changes

| Commit | Description |
|--------|-------------|
| `2e3c010` | Complete Python → TypeScript rewrite. All Python scripts, agents, and modules deleted. No backward compatibility. |

### 🟡 New Features & Behavioral Changes

| Commit | Description |
|--------|-------------|
| `2e3c010` | New TypeScript+Playwright orchestration engine with consolidated agent pattern |
| `d7f408e` | Generic button discovery (no more hardcoded selectors), multi-tier state detection, expanded demo infrastructure |
| `2225aac` | CI/CD via GitHub Actions (Node 20, Playwright, type checking) |

### 🟢 Fixes & Improvements

| Commit | Description |
|--------|-------------|
| `d7f408e` | `readState()` resilience — timeout, fallback chain, crash keyword detection |
| `d7f408e` | Force-click and error-swallowing for resilient exploration under crashes |
| `47f1c46` | Prose consistency (em-dash removal) |
| `46f7544` | Proper `.gitignore` for Node.js / Playwright artifacts |

---

## Pattern Trends Across Commits

### 1. Python → TypeScript Stack Migration

The single most defining trend. The entire Python codebase (agents, scripts, LLM integration, storage) was replaced with a lean TypeScript implementation. This brought:
- Stronger typing via `types.ts` contracts
- Native Playwright integration (vs. Python bindings)
- Simpler dependency management (`package.json` vs. `requirements.txt`)
- Loss of LLM/vision capabilities (a conscious trade-off)

### 2. Game-Specific → Generic Tool Evolution

The project evolved through three stages:
1. **Game-specific** (Python): Hardcoded game selectors, Foundry vision for game state
2. **Game-specific** (TypeScript `2e3c010`): Still hardcoded `#startBtn`, `#boostBtn`, `#fireBtn` selectors
3. **Generic** (`d7f408e`): Dynamic button discovery, generic state detection, works with any web app

### 3. Multi-Agent → Monolithic Orchestration

The Python architecture had distinct agent modules (explorer, chaos, reporter) communicating through shared models. The TypeScript version consolidated everything into a single `orchestrator.ts` that runs explorer → chaos → reporter phases sequentially. This simplified the architecture but reduced extensibility.

### 4. Planning → Execution → Presentation

The commit history shows a clear chronological arc:
1. **Planning phase** (50+ commits, pre-`c1238ed`): Feature development with phase-based planning
2. **Rebrand & migration** (`c1238ed`, `2e3c010`): Identity and technology reset
3. **Polish & presentation** (`29d3577` → `04cd975`): README, logo, CI, documentation
4. **Feature evolution** (`d7f408e`): Making the tool genuinely generic

### 5. Iterative Documentation Refinement

Documentation went through 10+ revision commits — README restructuring, logo addition, prose polishing, etymology addition, judge-first optimization. This suggests the project was being prepared for a public release or hackathon submission.

### 6. Demo Infrastructure Investment

Significant effort went into demo infrastructure: a dedicated test web app (SkyBoost), asciinema terminal recordings, voiceover scripts, and video assets. This indicates the project values reproducible, self-documenting demonstrations.

---

## Summary

The repatrol codebase has undergone a dramatic transformation over ~50 commits spanning ~3 weeks (Feb 15 → Mar 9, 2026):

- **Foundation rewrite** from Python to TypeScript + Playwright
- **Architectural simplification** from multi-agent to monolithic orchestration
- **Scope expansion** from a single-game QA tool to a generic web app testing framework
- **Maturity progression** from planning scaffolding to polished open-source project with CI, documentation, and demo infrastructure

The two most semantically significant commits are `2e3c010` (the TypeScript migration, which rewrote everything) and `d7f408e` (which made the explorer generic and hardened state detection). Together, they represent the project's core identity: a lightweight, Playwright-based web QA tool that dynamically discovers and tests interactive elements.

---

*Report generated by [Nightshift](https://github.com/Microck/nightshift) — automated codebase analysis.*
