from __future__ import annotations

from dataclasses import dataclass


class Report:
    """A basic class to report progress of the execution of code.

    This is probably an antipattern, but it works for me.
    """

    PROGRESS = 0
    ERROR = 1

    def __init__(self, type_: int, text: str, details: ProgressDetails | None = None) -> None:
        self.type = type_
        self.details = details

        self._text = text

    @property
    def text(self) -> str:
        return self._text if self.type == self.ERROR else self._text + "..."

    def to_dict(self) -> dict[str, object]:
        return {"type": self.type, "details": self.details.to_dict() if self.details else None, "text": self.text}


@dataclass(frozen=True, slots=True)
class ProgressDetails:
    processed: float
    totalsize: float
    unit: str

    def to_dict(self) -> dict[str, object]:
        return {"processed": self.processed, "totalsize": self.totalsize, "unit": self.unit}
