# README Outline (top-readme)

Project signals detected:
- Stack: Node.js + TypeScript (ESM) + Playwright
- Package: `repatrol` (from `package.json`)
- License: `LICENSE` (Apache-2.0)
- Env config: `.env.example` (GitHub + Foundry variables)
- Primary scripts (from `package.json`): `demo`, `serve`, `smoke`, `foundry:smoke`, `check`, `build`

## 1) Current README headings (verbatim)

From `README.md`:
- # Repatrol
- ## How it works
- ## Features
- ## Installation
- ## Quick Start
- ## Usage
- ## Artifacts
- ## GitHub Integration
- ## Optional: Foundry smoke test
- ## Demo
- ## Repo layout
- ## Contributing
- ## License

Note: also found an additional README at `demo/buggy_web_game/README.md` (not part of the root README structure).

## 2) Recommended outline (canonical, top-starred pattern)

1. Repatrol (title) + one-line value proposition (+ existing license badge)
2. Quickstart
3. Installation
4. Usage
5. Configuration
6. Artifacts (outputs)
7. How it works / Architecture
8. Development
9. Testing
10. Contributing
11. Support
12. Security
13. License
14. Releases / Changelog
15. Roadmap (optional)

## 3) Mapping table (current -> recommended)

| Current heading | Recommended section |
| --- | --- |
| Repatrol | Title + value proposition |
| How it works | How it works / Architecture |
| Features | (Keep) Features (or fold into intro) |
| Installation | Installation |
| Quick Start | Quickstart |
| Usage | Usage |
| Artifacts | Artifacts |
| GitHub Integration | Configuration (GitHub) |
| Optional: Foundry smoke test | Testing (optional) |
| Demo | Demo / Examples |
| Repo layout | How it works / Architecture |
| Contributing | Contributing |
| License | License |

## 4) Missing sections checklist

Sections that exist but likely need expansion/structure:
- Configuration: document `.env` setup (currently only GitHub/Foundry variables called out)
- Testing: clarify what `npm run smoke` covers and expected runtime
- Development: local dev workflow (watch mode, formatting/linting if any, debugging tips)

Sections not currently present (add if you want a top-starred style README):
- Support (where to ask questions, issue templates, discussions)
- Security (policy + reporting; consider adding `SECURITY.md`)
- Releases / Changelog (link to GitHub Releases or add `CHANGELOG.md`)
- Roadmap (optional)

## 5) Ready-to-copy README skeleton (tailored)

## 6) Apply-mode marker block (skeleton-only)

If apply mode is enabled, inject a single marker block near the top of `README.md` (before `## How it works`) containing ONLY missing sections as empty skeleton headings and links:

- Configuration (links to `.env.example` + existing GitHub/Foundry sections)
- Development (links to repo layout + package.json)
- Testing (links to usage + Foundry smoke section)
- Support (empty)
- Security (empty)
- Releases / Changelog (empty)
- Roadmap (empty)

```md
# Repatrol

Repatrol is a TypeScript + Playwright QA runner with a swarm-style workflow.

TODO: Add 1-2 sentences describing what makes it different (deterministic target, artifacts, issue drafting).

## Quickstart

Prereqs:
- Node.js 20+

```bash
npm install
npx playwright install chromium
npm run demo
```

TODO: Add what "success" looks like (where artifacts land, what you should see).

## Installation

```bash
npm install
npx playwright install chromium
```

## Usage

Run the full demo flow (serves target game + records video):

```bash
npm run demo
```

Serve only the target game:

```bash
npm run serve
```

Typecheck and build:

```bash
npm run check
npm run build
```

Run a fast smoke pass:

```bash
npm run smoke
```

Run the demo script directly (for flags):

```bash
npx tsx scripts/run-demo.ts --serve --mode demo --headless --dry-run-github
```

## Configuration

### Target game URL

```bash
TARGET_GAME_URL="https://example.com/" npm run demo
```

### GitHub integration (optional)

Repatrol defaults to dry-run issue generation.

Set these to enable real issue creation:
- `GITHUB_TOKEN`
- `GITHUB_REPO` (e.g. `owner/repo`)

See `.env.example`.

### Foundry smoke test (optional)

```bash
npm run foundry:smoke
```

It is skipped unless all are set:
- `FOUNDRY_ENDPOINT`
- `FOUNDRY_DEPLOYMENT`
- `FOUNDRY_API_VERSION`
- `FOUNDRY_API_KEY`

## Artifacts

Expected output paths:
- `artifacts/bugs/bug-*.json`
- `artifacts/coverage/<run_id>.json`
- `artifacts/runs/<run_id>/summary.json`
- `artifacts/runs/<run_id>/issue_body.md`
- `artifacts/screenshots/<run_id>/*.png`
- `artifacts/videos/<run_id>/*.webm`

TODO: Add a short note about how to interpret `summary.json` / `bug-*.json`.

## How it works

TODO: Add a diagram or a short flow explaining: serve -> explore -> chaos/crash -> artifacts -> issue draft.

## Development

TODO: Add local dev notes (tsc/tsx usage, debugging Playwright, recommended Node version manager).

## Testing

TODO: Define what `npm run smoke` asserts.

## Contributing

TODO: Add contribution guidelines (or add `CONTRIBUTING.md` and link it here).

## Support

TODO: Add where to ask questions (GitHub Issues/Discussions/etc.).

## Security

TODO: Add a security policy (or add `SECURITY.md` and link it here).

## License

Apache-2.0 (see `LICENSE`).
```
