from __future__ import annotations

import argparse
import time
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.detection.crash import CrashDetector
from src.detection.hang import HangDetector
from src.vision.game_state import GameState


def _run_hang_scenario() -> str:
    detector = HangDetector(max_same_screen_steps=3, max_loading_seconds=2.0)
    now = time.time()
    state = GameState(
        screen_id="PLAY",
        summary="same screen",
        action_hints=[],
        ui_elements=[],
        is_loading=False,
        warnings=[],
    )
    for idx in range(5):
        detector.observe(state, now + idx)
        reason = detector.check(now + idx)
        if reason:
            return reason
    return ""


def _run_crash_scenario() -> str:
    detector = CrashDetector()
    detector.observe_exception("DEMO_CRASH: forced smoke event")
    reason = detector.check()
    return reason or ""


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["hang", "crash"], required=True)
    args = parser.parse_args()

    reason = _run_hang_scenario() if args.mode == "hang" else _run_crash_scenario()
    if not reason:
        print("No detector trigger observed")
        return 2
    print(f"Triggered: {reason}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
