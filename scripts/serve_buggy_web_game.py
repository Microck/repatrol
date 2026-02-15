from __future__ import annotations

import argparse
import functools
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.request import urlopen


DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 4173
DEFAULT_DIRECTORY = Path("demo/buggy_web_game").resolve()


def _make_server(host: str, port: int, directory: Path) -> ThreadingHTTPServer:
    handler = functools.partial(SimpleHTTPRequestHandler, directory=str(directory))
    return ThreadingHTTPServer((host, port), handler)


def start_demo_server(
    *,
    host: str = DEFAULT_HOST,
    port: int = DEFAULT_PORT,
    directory: Path = DEFAULT_DIRECTORY,
) -> tuple[ThreadingHTTPServer, threading.Thread, str]:
    server = _make_server(host, port, directory)
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    actual_port = server.server_address[1]
    return server, worker, f"http://{host}:{actual_port}/"


def stop_demo_server(server: ThreadingHTTPServer) -> None:
    server.shutdown()
    server.server_close()


def _run_check(directory: Path) -> None:
    server, _, base_url = start_demo_server(
        host=DEFAULT_HOST, port=0, directory=directory
    )

    try:
        with urlopen(base_url, timeout=5) as resp:
            body = resp.read().decode("utf-8", errors="ignore")
            assert resp.status == 200
            assert "Buggy Web Game" in body
    finally:
        stop_demo_server(server)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    directory = DEFAULT_DIRECTORY
    if not directory.exists():
        raise SystemExit(f"Missing directory: {directory}")

    if args.check:
        _run_check(directory)
        print("OK: demo game is serveable")
        return 0

    server, _, base_url = start_demo_server(
        host=DEFAULT_HOST, port=args.port, directory=directory
    )
    print(f"Serving {directory} on {base_url} (Ctrl+C to stop)")
    try:
        while True:
            time.sleep(0.2)
    except KeyboardInterrupt:
        return 0
    finally:
        stop_demo_server(server)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
