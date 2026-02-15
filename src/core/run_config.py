from __future__ import annotations

from dataclasses import dataclass


@dataclass
class RunConfig:
    mode: str
    url: str
    headless: bool
    record_video: bool
    explorer_steps: int
    chaos_steps: int
    chaos_duration_seconds: int | None
    dry_run_github: bool

    @classmethod
    def for_mode(
        cls,
        *,
        mode: str,
        url: str,
        headless: bool,
        record_video: bool,
        dry_run_github: bool,
    ) -> "RunConfig":
        if mode == "soak":
            return cls(
                mode=mode,
                url=url,
                headless=headless,
                record_video=record_video,
                explorer_steps=60,
                chaos_steps=60,
                chaos_duration_seconds=120,
                dry_run_github=dry_run_github,
            )

        return cls(
            mode="demo",
            url=url,
            headless=headless,
            record_video=record_video,
            explorer_steps=20,
            chaos_steps=12,
            chaos_duration_seconds=30,
            dry_run_github=dry_run_github,
        )
