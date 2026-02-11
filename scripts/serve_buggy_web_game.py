from __future__ import annotations

import argparse
import functools
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.request import urlopen


def _make_server(host: str, port: int, directory: Path) -> ThreadingHTTPServer:
    handler = functools.partial(SimpleHTTPRequestHandler, directory=str(directory))
    return ThreadingHTTPServer((host, port), handler)


def _run_check(directory: Path) -> None:
    host = "127.0.0.1"
    server = _make_server(host, 0, directory)
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    port = server.server_address[1]

    try:
        with urlopen(f"http://{host}:{port}/", timeout=5) as resp:
            body = resp.read().decode("utf-8", errors="ignore")
            assert resp.status == 200
            assert "Buggy Web Game" in body
    finally:
        server.shutdown()
        server.server_close()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=4173)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    directory = Path("demo/buggy_web_game").resolve()
    if not directory.exists():
        raise SystemExit(f"Missing directory: {directory}")

    if args.check:
        _run_check(directory)
        print("OK: demo game is serveable")
        return 0

    host = "127.0.0.1"
    server = _make_server(host, args.port, directory)
    print(f"Serving {directory} on http://{host}:{args.port}/ (Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        return 0
    finally:
        server.shutdown()
        server.server_close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
