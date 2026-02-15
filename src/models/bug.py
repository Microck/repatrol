from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
import json
from pathlib import Path
from typing import Any
from uuid import uuid4


def _utc_now_iso() -> str:
    return datetime.now(UTC).isoformat()


@dataclass
class BugEvidence:
    screenshot_path: str | None = None
    state_path: str | None = None
    video_path: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "screenshot_path": self.screenshot_path,
            "state_path": self.state_path,
            "video_path": self.video_path,
        }

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> "BugEvidence":
        return cls(
            screenshot_path=payload.get("screenshot_path"),
            state_path=payload.get("state_path"),
            video_path=payload.get("video_path"),
        )


@dataclass
class BugReport:
    run_id: str
    detector: str
    reason: str
    last_state: dict[str, Any]
    repro_steps: list[str]
    evidence: BugEvidence = field(default_factory=BugEvidence)
    created_at: str = field(default_factory=_utc_now_iso)
    bug_id: str = field(default_factory=lambda: f"bug-{uuid4().hex[:10]}")

    def to_dict(self) -> dict[str, Any]:
        return {
            "bug_id": self.bug_id,
            "run_id": self.run_id,
            "created_at": self.created_at,
            "detector": self.detector,
            "reason": self.reason,
            "last_state": self.last_state,
            "repro_steps": list(self.repro_steps),
            "evidence": self.evidence.to_dict(),
        }

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> "BugReport":
        return cls(
            bug_id=str(payload.get("bug_id", f"bug-{uuid4().hex[:10]}")),
            run_id=str(payload.get("run_id", "unknown-run")),
            created_at=str(payload.get("created_at", _utc_now_iso())),
            detector=str(payload.get("detector", "unknown")),
            reason=str(payload.get("reason", "unknown")),
            last_state=dict(payload.get("last_state", {})),
            repro_steps=[str(step) for step in payload.get("repro_steps", [])],
            evidence=BugEvidence.from_dict(dict(payload.get("evidence", {}))),
        )

    def to_json(self, path: str | Path) -> Path:
        out_path = Path(path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(
            json.dumps(self.to_dict(), indent=2, sort_keys=True), encoding="utf-8"
        )
        return out_path

    @classmethod
    def from_json(cls, path: str | Path) -> "BugReport":
        payload = json.loads(Path(path).read_text(encoding="utf-8"))
        return cls.from_dict(payload)
