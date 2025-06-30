from __future__ import annotations

import functools
import logging
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from collections.abc import Callable


def typed_namespace[T](cls: type[T]) -> T:
    return cls()


def log_callable[**A, R](callable_: Callable[A, R]) -> Callable[A, R]:
    @functools.wraps(callable_)
    def wrapper(*args: A.args, **kwargs: A.kwargs) -> R:
        logging.getLogger(__name__).debug("Called %s with args=%s, kwargs=%s", callable_.__qualname__, args, kwargs)
        return callable_(*args, **kwargs)

    return wrapper
