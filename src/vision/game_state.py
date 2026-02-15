from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class UIElement:
    label: str
    type: str = "button"
    location: str | None = None

    @classmethod
    def from_dict(cls, value: dict[str, Any]) -> "UIElement":
        return cls(
            label=str(value.get("label", "")),
            type=str(value.get("type", "unknown")),
            location=(
                str(value.get("location"))
                if value.get("location") not in (None, "")
                else None
            ),
        )

    def to_dict(self) -> dict[str, Any]:
        data = {"label": self.label, "type": self.type}
        if self.location:
            data["location"] = self.location
        return data


@dataclass
class GameState:
    screen_id: str
    summary: str
    action_hints: list[str] = field(default_factory=list)
    ui_elements: list[UIElement] = field(default_factory=list)
    is_loading: bool = False
    warnings: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "screen_id": self.screen_id,
            "summary": self.summary,
            "action_hints": list(self.action_hints),
            "ui_elements": [element.to_dict() for element in self.ui_elements],
            "is_loading": bool(self.is_loading),
            "warnings": list(self.warnings),
        }

    @classmethod
    def from_dict(cls, value: dict[str, Any]) -> "GameState":
        action_hints_raw = value.get("action_hints", [])
        action_hints = [str(item) for item in action_hints_raw if item is not None]

        ui_raw = value.get("ui_elements", [])
        ui_elements: list[UIElement] = []
        for item in ui_raw:
            if isinstance(item, dict):
                ui_elements.append(UIElement.from_dict(item))
            elif item is not None:
                ui_elements.append(UIElement(label=str(item), type="unknown"))

        warnings_raw = value.get("warnings", [])
        warnings = [str(item) for item in warnings_raw if item is not None]

        return cls(
            screen_id=str(value.get("screen_id", "unknown")),
            summary=str(value.get("summary", "")),
            action_hints=action_hints,
            ui_elements=ui_elements,
            is_loading=bool(value.get("is_loading", False)),
            warnings=warnings,
        )
