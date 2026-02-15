from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from src.integrations.github import GitHubIssueClient
from src.llm.client import LLMClient
from src.models.bug import BugReport
from src.storage.evidence import EvidenceRef, EvidenceStore, LocalEvidenceStore


@dataclass
class ReporterResult:
    title: str
    body: str
    issue_url: str | None
    evidence_refs: list[EvidenceRef]


class ReporterAgent:
    def __init__(
        self,
        *,
        evidence_store: EvidenceStore | None = None,
        github_client: GitHubIssueClient | None = None,
        llm: LLMClient | None = None,
    ) -> None:
        self.evidence_store = evidence_store or LocalEvidenceStore()
        self.github_client = github_client or GitHubIssueClient(dry_run=True)
        self.llm = llm

    def _publish_evidence(self, bug: BugReport) -> list[EvidenceRef]:
        refs: list[EvidenceRef] = []

        def _publish(kind: str, file_path: str | None) -> None:
            if not file_path:
                return
            path_obj = Path(file_path)
            if path_obj.exists():
                refs.append(self.evidence_store.publish(path_obj, kind=kind))
            else:
                refs.append(EvidenceRef(kind=kind, path=str(path_obj), url=None))

        _publish("screenshot", bug.evidence.screenshot_path)
        _publish("video", bug.evidence.video_path)
        _publish("state", bug.evidence.state_path)
        return refs

    def _ensure_repro_steps(self, bug: BugReport) -> list[str]:
        if bug.repro_steps:
            return list(bug.repro_steps)
        return [
            "Start the target game",
            "Replay the action log from this bug run",
            "Observe crash/hang condition described in the reason",
        ]

    def _summarize_reason(self, bug: BugReport) -> str:
        if self.llm is None:
            return bug.reason
        prompt = (
            "Rewrite this bug reason as one clear sentence for a GitHub issue body: "
            f"{bug.reason}"
        )
        try:
            return self.llm.text(prompt).strip()
        except Exception:
            return bug.reason

    def render_issue(self, bug: BugReport) -> tuple[str, str, list[EvidenceRef]]:
        evidence_refs = self._publish_evidence(bug)
        bug_dict = bug.to_dict()
        bug_dict["repro_steps"] = self._ensure_repro_steps(bug)
        bug_dict["reason"] = self._summarize_reason(bug)
        title, body = self.github_client.render_issue(
            bug_dict,
            [ref.to_dict() for ref in evidence_refs],
        )
        return title, body, evidence_refs

    def report(self, bug: BugReport, *, dry_run: bool = True) -> ReporterResult:
        self.github_client.dry_run = dry_run
        title, body, evidence_refs = self.render_issue(bug)

        issue_url: str | None = None
        issue = self.github_client.create_issue(
            title=title, body=body, labels=["bug", "qa-swarm"]
        )
        issue_url = issue.get("url")

        return ReporterResult(
            title=title,
            body=body,
            issue_url=issue_url,
            evidence_refs=evidence_refs,
        )
