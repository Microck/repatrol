from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path


REQUIRED_ENV = [
    "FOUNDRY_ENDPOINT",
    "FOUNDRY_DEPLOYMENT",
    "FOUNDRY_API_VERSION",
    "FOUNDRY_API_KEY",
]


def _missing_env() -> list[str]:
    missing = []
    for k in REQUIRED_ENV:
        if not os.getenv(k):
            missing.append(k)
    return missing


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True)
    args = parser.parse_args()

    cfg_path = Path(args.config)
    if not cfg_path.exists():
        print(f"Config not found: {cfg_path}")
        return 2

    # Basic shape check (no YAML parsing dependency)
    data = json.loads(cfg_path.read_text(encoding="utf-8"))
    if "project" not in data or "foundry" not in data:
        print("Invalid config JSON: missing project/foundry")
        return 2

    missing = _missing_env()
    if missing:
        print("Missing Foundry environment variables. Export them in your shell:")
        for k in missing:
            print(f'export {k}=""')
        return 3

    endpoint = os.environ["FOUNDRY_ENDPOINT"].rstrip("/")
    deployment = os.environ["FOUNDRY_DEPLOYMENT"]
    api_version = os.environ["FOUNDRY_API_VERSION"]
    api_key = os.environ["FOUNDRY_API_KEY"]

    url = f"{endpoint}/openai/deployments/{deployment}/chat/completions?api-version={api_version}"
    body = json.dumps(
        {"messages": [{"role": "user", "content": "ping"}], "max_tokens": 1}
    ).encode("utf-8")

    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("api-key", api_key)

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            print(f"OK: Foundry request succeeded (status={resp.status})")
            return 0
    except urllib.error.HTTPError as exc:
        print(f"HTTP error (status={exc.code})")
        return 4
    except Exception as exc:
        print(f"Request failed: {type(exc).__name__}: {exc}")
        return 4


if __name__ == "__main__":
    raise SystemExit(main())
