from __future__ import annotations

import argparse
import functools
import shutil
import subprocess
import sys
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from playwright.sync_api import ViewportSize, sync_playwright

from src.automation.recorder import SessionRecorder
from src.config.target_game import DEFAULT_VIEWPORT


def _serve_game_ephemeral() -> tuple[ThreadingHTTPServer, str]:
    directory = Path("demo/buggy_web_game").resolve()
    handler = functools.partial(SimpleHTTPRequestHandler, directory=str(directory))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    port = server.server_address[1]
    return server, f"http://127.0.0.1:{port}/"


def _convert_to_mp4(src: Path) -> Path | None:
    if shutil.which("ffmpeg") is None:
        return None
    out = src.with_suffix(".mp4")
    cmd = ["ffmpeg", "-y", "-i", str(src), str(out)]
    proc = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if proc.returncode != 0:
        return None
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="")
    parser.add_argument("--headless", action="store_true")
    parser.add_argument("--seconds", type=int, default=3)
    args = parser.parse_args()

    server = None
    url = args.url
    if not url:
        server, url = _serve_game_ephemeral()

    recorder = SessionRecorder()
    run_id = recorder.new_run_id()
    context_kwargs = recorder.attach_to_context(run_id)

    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=args.headless)
            viewport: ViewportSize = {
                "width": DEFAULT_VIEWPORT["width"],
                "height": DEFAULT_VIEWPORT["height"],
            }
            context = browser.new_context(viewport=viewport, **context_kwargs)
            page = context.new_page()
            page.goto(url, wait_until="domcontentloaded")
            page.click("#startBtn")
            page.click("#boostBtn")
            time.sleep(max(1, args.seconds))

            video_path = recorder.finalize(context, page=page, run_id=run_id)
            if not video_path.exists() or video_path.stat().st_size == 0:
                print("ERROR: video missing or empty")
                return 2

            print(f"OK: wrote video: {video_path}")
            mp4 = _convert_to_mp4(video_path)
            if mp4 is not None:
                if not mp4.exists() or mp4.stat().st_size == 0:
                    print("ERROR: mp4 conversion failed")
                    return 3
                print(f"OK: wrote mp4: {mp4}")
            return 0
    finally:
        if server is not None:
            server.shutdown()
            server.server_close()


if __name__ == "__main__":
    raise SystemExit(main())
