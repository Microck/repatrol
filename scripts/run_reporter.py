from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.agents.reporter_agent import ReporterAgent
from src.integrations.github import GitHubIssueClient
from src.models.bug import BugReport
from src.storage.evidence import LocalEvidenceStore


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--bug", required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    bug = BugReport.from_json(args.bug)

    use_dry_run = args.dry_run or not bool(os.getenv("GITHUB_TOKEN"))
    github = GitHubIssueClient(dry_run=use_dry_run)
    reporter = ReporterAgent(
        evidence_store=LocalEvidenceStore(),
        github_client=github,
    )

    result = reporter.report(bug, dry_run=use_dry_run)
    print(result.body)
    if not use_dry_run and result.issue_url:
        print(f"Issue URL: {result.issue_url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
