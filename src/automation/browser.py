from __future__ import annotations

from pathlib import Path
from typing import Any

from playwright.sync_api import sync_playwright


class BrowserGameDriver:
    def __init__(self) -> None:
        self._pw = None
        self._browser = None
        self._context = None
        self.page = None

    def start(
        self, url: str, *, headless: bool = True, viewport: Any | None = None
    ) -> None:
        self._pw = sync_playwright().start()
        self._browser = self._pw.chromium.launch(headless=headless)
        context_kwargs: dict[str, Any] = {}
        if viewport is not None:
            context_kwargs["viewport"] = viewport
        self._context = self._browser.new_context(**context_kwargs)
        self.page = self._context.new_page()
        self.page.goto(url, wait_until="domcontentloaded")

    def screenshot(self, path: str | Path) -> str:
        if self.page is None:
            raise RuntimeError("driver not started")
        out = Path(path)
        out.parent.mkdir(parents=True, exist_ok=True)
        self.page.screenshot(path=str(out), full_page=True)
        return str(out)

    def click(self, target: str | tuple[int, int]) -> None:
        if self.page is None:
            raise RuntimeError("driver not started")
        if isinstance(target, str):
            self.page.click(target)
            return
        x, y = target
        self.page.mouse.click(x, y)

    def type(self, text: str) -> None:
        if self.page is None:
            raise RuntimeError("driver not started")
        self.page.keyboard.type(text)

    def close(self) -> None:
        try:
            if self._context is not None:
                self._context.close()
        finally:
            if self._browser is not None:
                self._browser.close()
            if self._pw is not None:
                self._pw.stop()
