# Repatrol

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

Repatrol is a TypeScript + Playwright QA runner with a swarm-style workflow.

It plays a deterministic target web game, detects failures, captures evidence (screenshots + video), and drafts GitHub issues with reproduction steps.

<!-- top-readme: begin -->
## Configuration
- Environment variables: [`.env.example`](.env.example)
- Related sections: [GitHub Integration](#github-integration), [Optional: Foundry smoke test](#optional-foundry-smoke-test)

## Development
- Orientation: [Repo layout](#repo-layout)
- Scripts: [`package.json`](package.json)

## Testing
- Smoke run: [Usage](#usage)
- Optional: [Foundry smoke test](#optional-foundry-smoke-test)

## Support

## Security

## Releases / Changelog

## Roadmap
<!-- top-readme: end -->

## How it works

1. Serve (or point at) a deterministic target web app
2. Run an "explorer" pass to record screen/action coverage
3. Run a deterministic "chaos" path that triggers a known crash
4. Persist artifacts (screenshots/video/JSON) and draft an issue body
5. Optionally create a GitHub issue (dry-run by default)

## Features

- Playwright-driven game automation
- Deterministic crash path for repeatable bug detection
- Evidence artifacts: JSON, markdown issue body, videos
- Optional GitHub issue creation (dry-run by default)

## Installation

Prereqs:
- Node.js 20+

```bash
npm install
npx playwright install chromium
```

## Quick Start

Run the full demo flow (serves the target game + records video):

```bash
npm run demo
```

Serve only the target game:

```bash
npm run serve
```

## Usage

Typecheck and build:

```bash
npm run check
npm run build
```

Run a fast smoke pass:

```bash
npm run smoke
```

Run the demo script directly (useful for flags):

```bash
npx tsx scripts/run-demo.ts --serve --mode demo --headless --dry-run-github
```

Target a different URL (instead of serving the bundled demo):

```bash
TARGET_GAME_URL="https://example.com/" npm run demo
```

## Artifacts

Expected output paths:

- `artifacts/bugs/bug-*.json`
- `artifacts/coverage/<run_id>.json`
- `artifacts/runs/<run_id>/summary.json`
- `artifacts/runs/<run_id>/issue_body.md`
- `artifacts/screenshots/<run_id>/*.png`
- `artifacts/videos/<run_id>/*.webm`

## GitHub Integration

Repatrol defaults to dry-run issue generation.

To enable real issue creation, set:

- `GITHUB_TOKEN`
- `GITHUB_REPO` (e.g. `owner/repo`)

## Optional: Foundry smoke test

There is a tiny Foundry connectivity smoke test:

```bash
npm run foundry:smoke
```

It is skipped unless all of these are set:

- `FOUNDRY_ENDPOINT`
- `FOUNDRY_DEPLOYMENT`
- `FOUNDRY_API_VERSION`
- `FOUNDRY_API_KEY`

See `.env.example` for the full list.

## Demo

- Video: TBD
- Script and checklist:
  - `demo/demo_script.md`
  - `demo/demo_checklist.md`

## Repo layout

- `src/orchestrator.ts`: main flow (explore -> crash -> artifacts -> issue draft)
- `scripts/run-demo.ts`: demo runner (optionally serves the game)
- `demo/buggy_web_game/`: deterministic target app

## Contributing

Issues and pull requests are welcome.

## License

Apache-2.0 (see `LICENSE`).
