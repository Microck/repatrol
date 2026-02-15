# ReplayRig

ReplayRig is a multi-agent game QA swarm that plays an intentionally buggy web game, detects failures, and drafts a GitHub issue with evidence. The default demo flow runs fully local and deterministic so you can reproduce results quickly.

## Demo Quickstart

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
python3 -m playwright install chromium

python3 scripts/run_demo.py --serve --mode demo --headless --dry-run-github
python3 scripts/record_demo_video.py --headless --out demo/video.mp4
```

What you should see:

- A bug report JSON under `artifacts/bugs/`
- A run summary JSON under `artifacts/runs/<run_id>/summary.json`
- A rendered issue body under `artifacts/runs/<run_id>/issue_body.md`
- A demo video at `demo/video.mp4`

## How It Works

- Explorer Agent captures screenshots, uses vision state extraction, and grows coverage.
- Chaos Agent sends adversarial inputs (rapid clicks, random clicks, spam typing).
- Crash/Hang detectors watch browser signals and repeated state patterns.
- Evidence capture stores screenshot/state/video pointers in a `BugReport`.
- Reporter Agent renders a GitHub issue body and creates an issue (or dry-run output).

## Configuration

Optional Foundry live mode (mock mode works without these):

- `FOUNDRY_ENDPOINT`
- `FOUNDRY_DEPLOYMENT`
- `FOUNDRY_API_VERSION`
- `FOUNDRY_API_KEY`

Optional GitHub issue creation:

- `GITHUB_TOKEN`
- `GITHUB_REPO` (format: `owner/repo`)

If GitHub credentials are missing, runners automatically use dry-run mode.

## Artifacts Layout

- `artifacts/screenshots/` - step screenshots and smoke captures
- `artifacts/videos/` - Playwright recordings and mp4 conversions
- `artifacts/bugs/` - serialized bug reports (`BugReport` JSON)
- `artifacts/coverage/` - coverage snapshots from Explorer
- `artifacts/runs/<run_id>/` - run-level summary and rendered issue markdown
