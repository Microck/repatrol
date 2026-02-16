# Repatrol

## What This Is

A multi-agent game testing system where AI agents autonomously play your game looking for bugs. Each agent has a distinct "personality" — Explorer finds all areas, Chaos breaks things, Regression replays known issues — then Reporter files GitHub issues with video evidence. Built for the Microsoft AI Dev Days Hackathon 2026.

## Core Value

**Instead of manual QA, a swarm of AI agents with different testing strategies autonomously play your game, find bugs, and file GitHub issues with video evidence and reproduction steps.**

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Test Orchestrator that coordinates agent execution
- [ ] Explorer Agent that systematically visits all game areas
- [ ] Chaos Agent that performs adversarial/edge-case inputs
- [ ] Reporter Agent that creates GitHub issues with repro steps
- [ ] Screen capture and video recording of bugs
- [ ] LLM vision for game state understanding
- [ ] Crash/hang detection
- [ ] 2-minute demo video showing bug discovery and issue filing

### Out of Scope

- 3D games — simple 2D or web game for MVP
- Multiple games — single target game for demo
- Real-time streaming — recorded sessions only
- Regression Agent — cut if time is short
- Integration with game engines — external automation only

## Context

**Hackathon:** Microsoft AI Dev Days 2026 (Feb 10 - Mar 15, 2026)

**Target Prizes:**
- Primary: Agentic DevOps ($20,000)
- Secondary: Multi-Agent ($10,000)

**Why This Wins:**
- Novel interaction: Agents playing games is visually compelling
- Multi-agent personalities: Explorer, Chaos = memorable demo
- DevOps angle: Automated QA is legitimate DevOps
- Gaming expertise: Understanding what breaks games

**Target Game Options:**
1. Web game — easiest to automate (browser control)
2. Simple Unity game — build a test target
3. Retro game emulator — predictable, well-documented

## Constraints

- **Timeline**: 5 weeks (Feb 10 - Mar 15, 2026)
- **Tech Stack**: Python, Microsoft Agent Framework, Azure AI Foundry
- **Model Access**: GPT-4o with vision via Foundry
- **Automation**: PyAutoGUI, browser automation
- **Storage**: Azure Blob Storage (videos/screenshots)
- **Integration**: GitHub API for issue creation
- **Demo**: 2-minute video required

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web game target | Easiest automation via browser | — Pending |
| 3 agent personalities | Memorable demo, different strategies | — Pending |
| LLM vision for state | Understand game screens | — Pending |
| GitHub issue output | Real-world integration | — Pending |

---
*Last updated: 2026-02-08 after project initialization*
