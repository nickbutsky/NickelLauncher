from __future__ import annotations

import shutil
import tempfile
from pathlib import Path
from typing import TYPE_CHECKING
from urllib import request
from uuid import uuid4

from backend.report import Report

if TYPE_CHECKING:
    from collections.abc import Callable

    from backend.cancellationtoken import CancellationToken


def download_file(
    url: str,
    destination: Path,
    cancellation_token: CancellationToken | None = None,
    reporthook: Callable[[Report], object] | None = None,
) -> None:
    temp_file = Path(tempfile.mkdtemp()) / str(uuid4())
    urlretrieve_reporthook = _get_urlretrieve_reporthook(reporthook, cancellation_token)
    try:
        request.urlretrieve(url, temp_file, urlretrieve_reporthook)  # noqa: S310
    except:  # noqa: TRY203
        raise
    else:
        temp_file.replace(destination)
    finally:
        shutil.rmtree(temp_file.parent, True)


def _get_urlretrieve_reporthook(
    reporthook: Callable[[Report], object] | None = None,
    cancellation_token: CancellationToken | None = None,
) -> Callable[[int, int, int], None]:
    def urlretrieve_reporthook(block_num: int, block_size: int, total_size: int) -> None:
        if cancellation_token:
            cancellation_token.check()

        if not reporthook:
            return

        if total_size <= 0:
            reporthook(Report(Report.Type.PROGRESS, "Downloading..."))
            return
        rounded_total_size = round(float(total_size) / pow(1024, 2), 1)
        reporthook(
            Report(
                Report.Type.PROGRESS,
                "Downloading...",
                Report.Progress(
                    min(round(float(block_num * block_size) / pow(1024, 2), 1), rounded_total_size),
                    rounded_total_size,
                    "MB",
                ),
            ),
        )

    return urlretrieve_reporthook
