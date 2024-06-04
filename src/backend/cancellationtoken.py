from __future__ import annotations


class CancellationTokenSource:
    def __init__(self) -> None:
        self._token = CancellationToken()

    @property
    def token(self) -> CancellationToken:
        return self._token

    def cancel(self) -> None:
        self._token._cancelled = True  # pyright: ignore [reportPrivateUsage] # noqa: SLF001


class CancellationToken:
    def __init__(self) -> None:
        self._cancelled = False

    def check(self) -> None:
        if self._cancelled:
            raise Cancelled


class Cancelled(Exception):  # noqa: N818
    pass
