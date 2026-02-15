from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from src.agents.chaos_agent import ChaosAgent
from src.agents.explorer_agent import ExplorerAgent
from src.agents.reporter_agent import ReporterAgent
from src.automation.recorder import SessionRecorder
from src.config.target_game import TARGET_GAME_URL
from src.core.run_config import RunConfig
from src.core.run_context import RunContext
from src.integrations.github import GitHubIssueClient
from src.models.bug import BugReport
from src.storage.evidence import LocalEvidenceStore


class TestOrchestrator:
    def __init__(
        self, *, config: RunConfig, artifacts_root: str | Path = "artifacts"
    ) -> None:
        self.config = config
        self.artifacts_root = Path(artifacts_root)

    def run(self) -> dict[str, Any]:
        run_id = SessionRecorder.new_run_id()
        ctx = RunContext(run_id=run_id, artifacts_root=self.artifacts_root)
        target_url = self.config.url or TARGET_GAME_URL

        explorer = ExplorerAgent(url=target_url)
        coverage_summary = explorer.run(
            steps=self.config.explorer_steps,
            headless=self.config.headless,
            out_path=ctx.coverage_path(),
            run_context=ctx,
        )

        chaos = ChaosAgent(
            url=target_url,
            run_context=ctx,
            record_video=self.config.record_video,
        )
        bug_path = chaos.run(
            steps=self.config.chaos_steps,
            duration_seconds=self.config.chaos_duration_seconds,
            headless=self.config.headless,
        )

        issue_url: str | None = None
        issue_body_path: str | None = None
        if bug_path is not None:
            bug = BugReport.from_json(bug_path)
            use_dry_run = self.config.dry_run_github or not bool(
                os.getenv("GITHUB_TOKEN")
            )
            github = GitHubIssueClient(dry_run=use_dry_run)
            reporter = ReporterAgent(
                evidence_store=LocalEvidenceStore(),
                github_client=github,
            )
            reporter_result = reporter.report(bug, dry_run=use_dry_run)
            issue_url = reporter_result.issue_url

            issue_body_file = ctx.run_dir() / "issue_body.md"
            issue_body_file.write_text(reporter_result.body, encoding="utf-8")
            issue_body_path = str(issue_body_file)

        summary = {
            "run_id": run_id,
            "mode": self.config.mode,
            "target_url": target_url,
            "coverage": coverage_summary,
            "bug_found": bug_path is not None,
            "bug_path": str(bug_path) if bug_path else None,
            "issue_url": issue_url,
            "issue_body_path": issue_body_path,
        }

        summary_path = ctx.run_dir() / "summary.json"
        summary_path.write_text(
            json.dumps(summary, indent=2, sort_keys=True), encoding="utf-8"
        )
        summary["summary_path"] = str(summary_path)
        return summary
