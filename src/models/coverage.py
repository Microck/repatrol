from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any

from src.vision.game_state import GameState


def _utc_now_iso() -> str:
    return datetime.now(UTC).isoformat()


@dataclass
class CoverageTracker:
    expected_screens: list[str] = field(default_factory=list)
    screens_seen: set[str] = field(default_factory=set)
    actions_seen: set[str] = field(default_factory=set)
    first_seen_at: dict[str, str] = field(default_factory=dict)
    observations: int = 0

    def observe(self, state: GameState) -> None:
        self.observations += 1
        screen_id = state.screen_id.strip() or "unknown"
        if screen_id not in self.screens_seen:
            self.first_seen_at[screen_id] = _utc_now_iso()
        self.screens_seen.add(screen_id)

        for hint in state.action_hints:
            hint_text = hint.strip()
            if hint_text:
                self.actions_seen.add(hint_text)

    def coverage_percent(self) -> float:
        if self.expected_screens:
            expected = set(self.expected_screens)
            if not expected:
                return 0.0
            return round((len(self.screens_seen & expected) / len(expected)) * 100.0, 2)

        # Heuristic for unknown games: 4 coarse screen families gives readable progress.
        return round(min(len(self.screens_seen), 4) / 4 * 100.0, 2)

    def summary(self) -> dict[str, Any]:
        return {
            "screens_seen": sorted(self.screens_seen),
            "actions_seen": sorted(self.actions_seen),
            "first_seen_at": dict(sorted(self.first_seen_at.items())),
            "observations": self.observations,
            "coverage_percent": self.coverage_percent(),
        }

    def to_dict(self) -> dict[str, Any]:
        return {
            "expected_screens": list(self.expected_screens),
            "screens_seen": sorted(self.screens_seen),
            "actions_seen": sorted(self.actions_seen),
            "first_seen_at": dict(sorted(self.first_seen_at.items())),
            "observations": self.observations,
        }

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> "CoverageTracker":
        tracker = cls(expected_screens=list(payload.get("expected_screens", [])))
        tracker.screens_seen = set(str(v) for v in payload.get("screens_seen", []))
        tracker.actions_seen = set(str(v) for v in payload.get("actions_seen", []))
        tracker.first_seen_at = {
            str(k): str(v) for k, v in dict(payload.get("first_seen_at", {})).items()
        }
        tracker.observations = int(payload.get("observations", 0))
        return tracker
