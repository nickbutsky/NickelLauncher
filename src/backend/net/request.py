from __future__ import annotations

import shutil
import tempfile
from pathlib import Path
from typing import TYPE_CHECKING
from urllib import request
from uuid import uuid4

from report import ProgressDetails, Report

if TYPE_CHECKING:
    from typing import Callable

    from cancellationtoken import CancellationToken


def download_file(
    url: str,
    destination: Path,
    cancellation_token: CancellationToken | None = None,
    reporthook: Callable[[Report], object] | None = None,
) -> None:
    temp_file = Path(tempfile.mkdtemp()) / str(uuid4())
    try:
        request.urlretrieve(  # noqa: S310
            url,
            temp_file,
            _get_urlretrieve_reporthook(reporthook, cancellation_token),
        )
    except Exception:
        shutil.rmtree(temp_file.parent, True)
        raise
    temp_file.replace(destination)
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
            reporthook(Report(Report.PROGRESS, "Downloading..."))
            return
        read_so_far = round(float(block_num * block_size) / pow(1024, 2), 1)
        rounded_total_size = round(float(total_size) / pow(1024, 2), 1)
        if read_so_far > rounded_total_size:
            read_so_far = rounded_total_size
        reporthook(Report(Report.PROGRESS, "Downloading...", ProgressDetails(read_so_far, rounded_total_size, "MB")))

    return urlretrieve_reporthook
