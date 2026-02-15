from __future__ import annotations

import base64
import hashlib
import json
import os
from pathlib import Path
from typing import Any
import urllib.error
import urllib.request

from src.llm.client import LLMClient


REQUIRED_ENV = (
    "FOUNDRY_ENDPOINT",
    "FOUNDRY_DEPLOYMENT",
    "FOUNDRY_API_VERSION",
    "FOUNDRY_API_KEY",
)


class FoundryLLMClient(LLMClient):
    def __init__(
        self,
        *,
        config_path: str | Path = "infra/foundry_config.json",
        mock: bool | None = None,
        timeout_seconds: int = 20,
    ) -> None:
        self.config_path = Path(config_path)
        self.mock = bool(int(os.getenv("FOUNDRY_MOCK", "0"))) if mock is None else mock
        self.timeout_seconds = timeout_seconds
        self._config_cache: dict[str, Any] | None = None

    def _load_config(self) -> dict[str, Any]:
        if self._config_cache is not None:
            return self._config_cache
        if not self.config_path.exists():
            return {}
        self._config_cache = json.loads(self.config_path.read_text(encoding="utf-8"))
        return self._config_cache

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
        if endpoint and deployment and api_version and api_key:
            return endpoint, deployment, api_version, api_key

        missing = [name for name in REQUIRED_ENV if not os.getenv(name)]
        raise RuntimeError("Missing Foundry env vars: " + ", ".join(missing))

    def _chat_completion(
        self, messages: list[dict[str, Any]], max_tokens: int
    ) -> dict[str, Any]:
        endpoint, deployment, api_version, api_key = self._require_env()
        url = (
            f"{endpoint.rstrip('/')}/openai/deployments/{deployment}"
            f"/chat/completions?api-version={api_version}"
        )
        body = json.dumps(
            {
                "messages": messages,
                "temperature": 0,
                "max_tokens": max_tokens,
            }
        ).encode("utf-8")

        req = urllib.request.Request(url, data=body, method="POST")
        req.add_header("Content-Type", "application/json")
        req.add_header("api-key", api_key)

        try:
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            body_text = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"Foundry HTTP {exc.code}: {body_text[:240]}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"Foundry request failed: {exc.reason}") from exc

    @staticmethod
    def _content_to_text(content: Any) -> str:
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            chunks: list[str] = []
            for item in content:
                if isinstance(item, dict) and item.get("type") == "text":
                    chunks.append(str(item.get("text", "")))
            return "\n".join(part for part in chunks if part)
        return str(content)

    def _parse_response_text(self, payload: dict[str, Any]) -> str:
        choices = payload.get("choices")
        if not isinstance(choices, list) or not choices:
            raise RuntimeError("Foundry response missing choices")
        first_choice = choices[0]
        if not isinstance(first_choice, dict):
            raise RuntimeError("Foundry response choices[0] must be an object")
        message = first_choice.get("message", {})
        if not isinstance(message, dict):
            raise RuntimeError("Foundry response message is invalid")
        content = self._content_to_text(message.get("content", "")).strip()
        if not content:
            raise RuntimeError("Foundry response did not contain message content")
        return content

    @staticmethod
    def _validate_schema(data: dict[str, Any], schema: dict[str, Any]) -> None:
        required = schema.get("required", [])
        if isinstance(required, list):
            for field_name in required:
                if field_name not in data:
                    raise ValueError(
                        f"Missing required field in model response: {field_name}"
                    )

    def _mock_vision_payload(self, prompt: str, image_bytes: bytes) -> dict[str, Any]:
        digest = hashlib.sha1(image_bytes).hexdigest()[:8]
        return {
            "screen_id": f"mock-{digest}",
            "summary": f"Mock vision summary for {prompt[:40]}",
            "action_hints": ["click START", "click BOOST", "click FIRE", "click BACK"],
            "ui_elements": [
                {"label": "START", "type": "button"},
                {"label": "BOOST", "type": "button"},
                {"label": "FIRE", "type": "button"},
            ],
            "is_loading": False,
            "warnings": [],
        }

    def text(self, prompt: str) -> str:
        if self.mock:
            return f"MOCK_TEXT: {prompt[:120]}"
        payload = self._chat_completion(
            messages=[{"role": "user", "content": prompt}],
            max_tokens=160,
        )
        return self._parse_response_text(payload)

    def vision_json(
        self, prompt: str, image_bytes: bytes, schema: dict[str, Any]
    ) -> dict[str, Any]:
        if self.mock:
            payload = self._mock_vision_payload(prompt, image_bytes)
            self._validate_schema(payload, schema)
            return payload

        encoded_image = base64.b64encode(image_bytes).decode("ascii")
        schema_text = json.dumps(schema, sort_keys=True)
        instruction = (
            f"{prompt}\n\n"
            "Return JSON only with no markdown or commentary. "
            f"Schema: {schema_text}"
        )
        payload = self._chat_completion(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": instruction},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{encoded_image}",
                            },
                        },
                    ],
                }
            ],
            max_tokens=300,
        )
        response_text = self._parse_response_text(payload)
        try:
            parsed = json.loads(response_text)
        except json.JSONDecodeError as exc:
            raise ValueError("Foundry vision response was not valid JSON") from exc
        if not isinstance(parsed, dict):
            raise ValueError("Foundry vision response JSON must be an object")
        self._validate_schema(parsed, schema)
        return parsed
