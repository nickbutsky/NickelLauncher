from __future__ import annotations

from dataclasses import dataclass
from enum import Enum, auto


@dataclass(frozen=True, slots=True)
class Report:
    type: Type
    text: str
    progress: Progress | None = None

    class Type(Enum):
        PROGRESS = auto()
        ERROR = auto()

    @dataclass(frozen=True, slots=True)
    class Progress:
        processed: float
        totalsize: float
        unit: str

        def to_dict(self) -> dict[str, object]:
            return {"processed": self.processed, "totalsize": self.totalsize, "unit": self.unit}

    def to_dict(self) -> dict[str, object]:
        return {
            "type": self.type.value,
            "text": self.text,
            "progress": self.progress.to_dict() if self.progress else None,
        }
