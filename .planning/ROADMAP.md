# Repatrol Roadmap

## Overview

Multi-agent game testing system where AI agents autonomously play games looking for bugs. Built for Microsoft AI Dev Days Hackathon 2026.

**Timeline:** 5 weeks (Feb 10 - Mar 15, 2026)
**Target Prizes:** Agentic DevOps ($20k), Multi-Agent ($10k)

---

## Phase 1: Foundation

**Goal:** Game automation infrastructure

**Duration:** ~1 week

**Requirements Covered:**
- FOUND-01: Foundry project initialized
- FOUND-02: Target game selected (simple web game)
- FOUND-03: Basic game automation (click, move, screenshot)
- FOUND-04: Screen capture and recording setup

**Success Criteria:**
1. Foundry project running
2. Target web game selected and accessible
3. Basic automation works (click, move, type)
4. Screen recording captures gameplay

**Deliverables:**
- `src/automation/browser.py`
- `src/automation/recorder.py`
- `infra/foundry_config.yaml`

---

## Phase 2: Explorer Agent

**Goal:** Systematic game exploration with LLM vision

**Duration:** ~1 week

**Requirements Covered:**
- EXPL-01: Explorer Agent navigates game systematically
- EXPL-02: LLM vision identifies game state from screenshots
- EXPL-03: Coverage tracking (areas visited, features tried)
- EXPL-04: Explorer discovers different game screens

**Success Criteria:**
1. Explorer navigates game without getting stuck
2. LLM vision correctly identifies game state
3. Coverage tracked (% of screens/features)
4. Multiple game screens discovered

**Deliverables:**
- `src/agents/explorer_agent.py`
- `src/vision/game_state.py`
- `src/models/coverage.py`

---

## Phase 3: Chaos Agent

**Goal:** Adversarial testing with crash detection

**Duration:** ~1 week

**Requirements Covered:**
- CHAOS-01: Chaos Agent performs random/adversarial inputs
- CHAOS-02: Chaos Agent tries edge cases (overflow, rapid clicks)
- CHAOS-03: Crash and hang detection
- CHAOS-04: Bug state capture (screenshot + state)

**Success Criteria:**
1. Random inputs sent to game
2. Edge cases attempted (rapid clicks, overflow)
3. Crashes and hangs detected reliably
4. Bug state captured with screenshot

**Deliverables:**
- `src/agents/chaos_agent.py`
- `src/detection/crash.py`
- `src/models/bug.py`

---

## Phase 4: Reporting

**Goal:** Bug synthesis + GitHub issue creation

**Duration:** ~1 week

**Requirements Covered:**
- REP-01: Reporter Agent synthesizes bug findings
- REP-02: Video recording of bug reproduction
- REP-03: GitHub issue creation with repro steps
- REP-04: Screenshot/video evidence attached to issues

**Success Criteria:**
1. Bug findings synthesized into report
2. Video shows bug reproduction
3. GitHub issue created automatically
4. Evidence attached to issue

**Deliverables:**
- `src/agents/reporter_agent.py`
- `src/integrations/github.py`
- `src/storage/evidence.py`

---

## Phase 5: Demo & Submit

**Goal:** Orchestrator + polished demo

**Duration:** ~1 week

**Requirements Covered:**
- DEMO-01: Test Orchestrator coordinates all agents
- DEMO-02: At least 1 real bug found and filed
- DEMO-03: 2-minute video showing bug discovery
- DEMO-04: README with setup and results

**Success Criteria:**
1. Orchestrator coordinates Explorer + Chaos + Reporter
2. At least 1 bug found and filed to GitHub
3. Video shows discovery flow in under 2 minutes
4. README includes setup and results

**Deliverables:**
- `src/core/orchestrator.py`
- `demo/video.mp4`
- `README.md`

---

## Coverage Validation

All 20 v1 requirements are mapped:
- Phase 1: FOUND-01 to FOUND-04 (4 requirements)
- Phase 2: EXPL-01 to EXPL-04 (4 requirements)
- Phase 3: CHAOS-01 to CHAOS-04 (4 requirements)
- Phase 4: REP-01 to REP-04 (4 requirements)
- Phase 5: DEMO-01 to DEMO-04 (4 requirements)

**Total: 20/20 requirements covered (100%)**

---

*Last updated: 2026-02-08*
