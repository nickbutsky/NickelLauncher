from dataclasses import dataclass
from enum import IntEnum, auto


@dataclass(frozen=True, slots=True)
class Report:
    type: Type
    text: str
    progress: Progress | None = None

    class Type(IntEnum):
        PROGRESS = auto()
        ERROR = auto()

    @dataclass(frozen=True, slots=True)
    class Progress:
        processed: float
        totalsize: float
        unit: str
