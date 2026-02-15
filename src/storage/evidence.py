from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass
class EvidenceRef:
    kind: str
    path: str
    url: str | None = None

    def to_dict(self) -> dict[str, str | None]:
        return {"kind": self.kind, "path": self.path, "url": self.url}


class EvidenceStore:
    def publish(self, path: str | Path, *, kind: str) -> EvidenceRef:
        raise NotImplementedError


class LocalEvidenceStore(EvidenceStore):
    def publish(self, path: str | Path, *, kind: str) -> EvidenceRef:
        local_path = Path(path)
        return EvidenceRef(kind=kind, path=str(local_path), url=None)
