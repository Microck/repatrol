# Requirements

## v1 Requirements

### Foundation (FOUND)

- [ ] **FOUND-01**: Foundry project initialized
- [ ] **FOUND-02**: Target game selected (simple web game)
- [ ] **FOUND-03**: Basic game automation (click, move, screenshot)
- [ ] **FOUND-04**: Screen capture and recording setup

### Explorer Agent (EXPL)

- [ ] **EXPL-01**: Explorer Agent navigates game systematically
- [ ] **EXPL-02**: LLM vision identifies game state from screenshots
- [ ] **EXPL-03**: Coverage tracking (areas visited, features tried)
- [ ] **EXPL-04**: Explorer discovers different game screens

### Chaos Agent (CHAOS)

- [ ] **CHAOS-01**: Chaos Agent performs random/adversarial inputs
- [ ] **CHAOS-02**: Chaos Agent tries edge cases (overflow, rapid clicks)
- [ ] **CHAOS-03**: Crash and hang detection
- [ ] **CHAOS-04**: Bug state capture (screenshot + state)

### Reporting (REP)

- [ ] **REP-01**: Reporter Agent synthesizes bug findings
- [ ] **REP-02**: Video recording of bug reproduction
- [ ] **REP-03**: GitHub issue creation with repro steps
- [ ] **REP-04**: Screenshot/video evidence attached to issues

### Demo (DEMO)

- [ ] **DEMO-01**: Test Orchestrator coordinates all agents
- [ ] **DEMO-02**: At least 1 real bug found and filed
- [ ] **DEMO-03**: 2-minute video showing bug discovery
- [ ] **DEMO-04**: README with setup and results

---

## v2 Requirements

### Enhancements

- [ ] Regression Agent (replay known bug scenarios)
- [ ] Coverage heatmap visualization
- [ ] Game engine error log integration
- [ ] Multiple game support

---

## Out of Scope

- **3D games** — simple 2D/web game only
- **Multiple games** — single target for demo
- **Real-time streaming** — recorded sessions only
- **Regression Agent** — cut if time is short
- **Game engine integration** — external automation only

---

## Traceability

| REQ-ID | Phase | Status | Success Criteria |
|--------|-------|--------|------------------|
| FOUND-01 | Phase 1: Foundation | Pending | Foundry project running |
| FOUND-02 | Phase 1: Foundation | Pending | Target game selected |
| FOUND-03 | Phase 1: Foundation | Pending | Basic automation works |
| FOUND-04 | Phase 1: Foundation | Pending | Recording works |
| EXPL-01 | Phase 2: Explorer | Pending | Agent navigates game |
| EXPL-02 | Phase 2: Explorer | Pending | Vision identifies state |
| EXPL-03 | Phase 2: Explorer | Pending | Coverage tracked |
| EXPL-04 | Phase 2: Explorer | Pending | Screens discovered |
| CHAOS-01 | Phase 3: Chaos | Pending | Random inputs sent |
| CHAOS-02 | Phase 3: Chaos | Pending | Edge cases tried |
| CHAOS-03 | Phase 3: Chaos | Pending | Crashes detected |
| CHAOS-04 | Phase 3: Chaos | Pending | Bug state captured |
| REP-01 | Phase 4: Reporting | Pending | Findings synthesized |
| REP-02 | Phase 4: Reporting | Pending | Video recorded |
| REP-03 | Phase 4: Reporting | Pending | GitHub issue created |
| REP-04 | Phase 4: Reporting | Pending | Evidence attached |
| DEMO-01 | Phase 5: Demo | Pending | Orchestrator works |
| DEMO-02 | Phase 5: Demo | Pending | Bug found and filed |
| DEMO-03 | Phase 5: Demo | Pending | Video recorded |
| DEMO-04 | Phase 5: Demo | Pending | README complete |

**Coverage:** 20/20 requirements mapped (100%)
