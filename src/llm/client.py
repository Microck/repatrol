from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class LLMClient(ABC):
    @abstractmethod
    def text(self, prompt: str) -> str: ...

    @abstractmethod
    def vision_json(
        self, prompt: str, image_bytes: bytes, schema: dict[str, Any]
    ) -> dict[str, Any]: ...
