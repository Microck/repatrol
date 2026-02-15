from __future__ import annotations

import argparse
import base64
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.llm.foundry_client import FoundryLLMClient
from src.vision.prompts import GAME_STATE_SCHEMA


TINY_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4//8/AwAI/AL+z2f8JwAAAABJRU5ErkJggg=="
)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--live", action="store_true")
    parser.add_argument("--mock-response", action="store_true")
    args = parser.parse_args()

    use_mock = not args.live or args.mock_response
    client = FoundryLLMClient(mock=use_mock)

    text_result = client.text("Summarize how ReplayRig works in one sentence.")
    vision_result = client.vision_json(
        prompt="Read this screenshot and return structured game state.",
        image_bytes=TINY_PNG,
        schema=GAME_STATE_SCHEMA,
    )

    print("text() =>")
    print(text_result)
    print("vision_json() =>")
    print(json.dumps(vision_result, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
