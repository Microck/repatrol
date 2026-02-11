from __future__ import annotations

import argparse
import json
from pathlib import Path


def validate_config(config_path: Path) -> None:
    data = json.loads(config_path.read_text(encoding="utf-8"))
    if "project" not in data or not isinstance(data["project"], dict):
        raise ValueError("Missing required object: project")
    if "foundry" not in data or not isinstance(data["foundry"], dict):
        raise ValueError("Missing required object: foundry")

    # Keys must exist; values may be empty in the default template.
    for key in ("endpoint", "deployment", "api_version"):
        if key not in data["foundry"]:
            raise ValueError(f"Missing required key: foundry.{key}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True)
    args = parser.parse_args()

    cfg = Path(args.config)
    if not cfg.exists():
        raise SystemExit(f"Config not found: {cfg}")

    yaml_mirror = cfg.with_suffix(".yaml")
    if not yaml_mirror.exists():
        raise SystemExit(f"YAML mirror missing: {yaml_mirror}")

    validate_config(cfg)
    print("OK: Foundry config shape is valid")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
