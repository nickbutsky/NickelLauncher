from __future__ import annotations

from enum import StrEnum, auto


class Architecture(StrEnum):
    X64 = auto()
    X86 = auto()
    ARM = auto()


class UnavailableArchitectureError(ValueError):
    pass
