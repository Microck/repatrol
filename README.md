# Repatrol

Repatrol is a TypeScript + Playwright multi-agent game QA swarm.

It plays an intentionally buggy web game, detects deterministic failures,
captures evidence, and drafts GitHub issues.

## Perfect Stack

- Runtime: Node.js 20+
- Language: TypeScript
- Automation: Playwright (Chromium)
- Reporting: GitHub REST API
- Evidence: local JSON + screenshots + Playwright video

## Demo Quickstart

```bash
npm install
npx playwright install chromium

npm run demo
```

This runs:

```bash
tsx scripts/run-demo.ts --serve --mode demo --headless --dry-run-github
```

Expected artifacts:

- `artifacts/bugs/bug-*.json`
- `artifacts/runs/<run_id>/summary.json`
- `artifacts/runs/<run_id>/issue_body.md`
- `artifacts/videos/<run_id>/*.webm`

## Commands

```bash
# Typecheck
npm run check

# Build JS output
npm run build

# Serve demo game manually
npm run serve

# Fast smoke run with screenshot
npm run smoke

# Optional Foundry smoke (requires env vars)
npm run foundry:smoke
```

## GitHub Integration

Set these only if you want real issue creation:

- `GITHUB_TOKEN`
- `GITHUB_REPO` (e.g. `owner/repo`)

If missing, Repatrol automatically uses dry-run mode.

## Demo Video Policy

Submission video should be human-recorded.

- Follow `demo/demo_script.md`
- Follow `demo/demo_checklist.md`
