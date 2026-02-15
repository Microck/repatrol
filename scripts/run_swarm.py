from __future__ import annotations

import argparse
import functools
import json
import os
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.config.target_game import TARGET_GAME_URL
from src.core.orchestrator import TestOrchestrator
from src.core.run_config import RunConfig


def _serve_demo_ephemeral() -> tuple[ThreadingHTTPServer, str]:
    directory = Path("demo/buggy_web_game").resolve()
    handler = functools.partial(SimpleHTTPRequestHandler, directory=str(directory))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    return server, f"http://127.0.0.1:{server.server_address[1]}/"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["demo", "soak"], default="demo")
    parser.add_argument("--url", default="")
    parser.add_argument("--headless", action="store_true")
    parser.add_argument("--dry-run-github", action="store_true")
    parser.add_argument(
        "--record-video", dest="record_video", action="store_true", default=True
    )
    parser.add_argument("--no-record-video", dest="record_video", action="store_false")
    args = parser.parse_args()

    server = None
    url = args.url
    if not url:
        server, url = _serve_demo_ephemeral()
    else:
        url = url or TARGET_GAME_URL

    try:
        config = RunConfig.for_mode(
            mode=args.mode,
            url=url,
            headless=args.headless,
            record_video=args.record_video,
            dry_run_github=args.dry_run_github or not bool(os.getenv("GITHUB_TOKEN")),
        )
        orchestrator = TestOrchestrator(config=config)
        result = orchestrator.run()
    finally:
        if server is not None:
            server.shutdown()
            server.server_close()

    print(json.dumps(result, indent=2, sort_keys=True))
    print(f"run_id={result['run_id']}")
    print(f"coverage={result['coverage'].get('coverage_percent')}%")
    print(f"bug_found={result['bug_found']}")
    if result.get("bug_path"):
        print(f"bug_path={result['bug_path']}")
    if result.get("issue_url"):
        print(f"issue_url={result['issue_url']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
