from __future__ import annotations


def typed_namespace[T](cls: type[T]) -> T:
    return cls()
