from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from src.llm.client import LLMClient


class FoundryLLMClient(LLMClient):
    def __init__(
        self,
        *,
        config_path: str | Path = "infra/foundry_config.json",
        mock: bool | None = None,
    ) -> None:
        self.config_path = Path(config_path)
        self.mock = bool(int(os.getenv("FOUNDRY_MOCK", "0"))) if mock is None else mock

    def _load_config(self) -> dict[str, Any]:
        if not self.config_path.exists():
            return {}
        return json.loads(self.config_path.read_text(encoding="utf-8"))

    def _config_value(self, key: str) -> str:
        foundry = self._load_config().get("foundry", {})
        value = foundry.get(key, "")
        return value if isinstance(value, str) else ""

    def _require_env(self) -> tuple[str, str, str, str]:
        endpoint = os.getenv("FOUNDRY_ENDPOINT") or self._config_value("endpoint")
        deployment = os.getenv("FOUNDRY_DEPLOYMENT") or self._config_value("deployment")
        api_version = os.getenv("FOUNDRY_API_VERSION") or self._config_value(
            "api_version"
        )
        api_key = os.getenv("FOUNDRY_API_KEY")
        if not (endpoint and deployment and api_version and api_key):
            raise RuntimeError(
                "Missing Foundry env vars (FOUNDRY_ENDPOINT, FOUNDRY_DEPLOYMENT, FOUNDRY_API_VERSION, FOUNDRY_API_KEY)"
            )
        return endpoint, deployment, api_version, api_key

    def text(self, prompt: str) -> str:
        if self.mock:
            return f"MOCK: {prompt[:80]}"
        self._require_env()
        raise NotImplementedError("Phase 1: live Foundry calls implemented in Phase 2")

    def vision_json(
        self, prompt: str, image_bytes: bytes, schema: dict[str, Any]
    ) -> dict[str, Any]:
        if self.mock:
            return {
                "mock": True,
                "summary": prompt[:80],
                "schema_keys": list(schema.keys()),
            }
        self._require_env()
        raise NotImplementedError("Phase 1: live Foundry calls implemented in Phase 2")
