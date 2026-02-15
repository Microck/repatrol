from __future__ import annotations

import argparse
import functools
import json
import sys
import threading
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.agents.explorer_agent import ExplorerAgent
from src.config.target_game import TARGET_GAME_URL


def _serve_demo_ephemeral() -> tuple[ThreadingHTTPServer, str]:
    directory = Path("demo/buggy_web_game").resolve()
    handler = functools.partial(SimpleHTTPRequestHandler, directory=str(directory))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    return server, f"http://127.0.0.1:{server.server_address[1]}/"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="")
    parser.add_argument("--steps", type=int, default=30)
    parser.add_argument("--headless", action="store_true")
    parser.add_argument("--out", default="artifacts/coverage.json")
    args = parser.parse_args()

    server = None
    url = args.url
    if not url:
        server, url = _serve_demo_ephemeral()
    else:
        url = url or TARGET_GAME_URL

    try:
        agent = ExplorerAgent(url=url)
        summary = agent.run(
            steps=max(1, args.steps),
            headless=args.headless,
            out_path=args.out,
        )
        print(json.dumps(summary, indent=2, sort_keys=True))
        return 0
    finally:
        if server is not None:
            server.shutdown()
            server.server_close()


if __name__ == "__main__":
    raise SystemExit(main())
