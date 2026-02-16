# Repatrol Demo Checklist

## Pre-demo checks

- [ ] Python virtualenv active and dependencies installed
- [ ] Playwright Chromium installed (`python3 -m playwright install chromium`)
- [ ] Port `4173` is free if using `--serve`
- [ ] Optional GitHub env vars set for live issue creation:
  - [ ] `GITHUB_TOKEN`
  - [ ] `GITHUB_REPO`

## Recording flow

- [ ] Start demo run:

```bash
python3 scripts/run_demo.py --serve --mode demo --headless --dry-run-github
```

- [ ] Confirm output contains:
  - [ ] `bug_path=...`
  - [ ] `issue_url=...`
  - [ ] `coverage_percent` inside JSON summary
- [ ] Verify artifacts exist:
  - [ ] `artifacts/bugs/*.json`
  - [ ] `artifacts/runs/<run_id>/summary.json`
  - [ ] `artifacts/runs/<run_id>/issue_body.md`
- [ ] Record submission video manually (screen recorder + voice narration) using `demo/demo_script.md`
- [ ] Verify output video is 1:45-2:15 and clearly shows bug discovery + issue draft
- [ ] Save final artifact to `demo/video.mp4` (or upload externally and store URL in submission notes)

## Fallback plan (no GitHub token)

- [ ] Keep `--dry-run-github` enabled in demo commands
- [ ] Show rendered markdown issue body in `artifacts/runs/<run_id>/issue_body.md`
- [ ] Explain that live issue creation activates automatically when `GITHUB_TOKEN` + `GITHUB_REPO` are set
