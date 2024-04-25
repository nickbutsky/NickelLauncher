from __future__ import annotations

from typing import TYPE_CHECKING
from urllib import request

from report import ProgressDetails, Report

if TYPE_CHECKING:
    from pathlib import Path
    from typing import Callable


def download_file(url: str, destination: Path, reporthook: Callable[[Report], object] | None = None) -> None:
    request.urlretrieve(url, destination, _download_reporthook_wrapper(reporthook) if reporthook else None)  # noqa: S310


def _download_reporthook_wrapper(reporthook: Callable[[Report], object]) -> Callable[[int, int, int], object]:
    def download_reporthook(block_num: int, block_size: int, total_size: int) -> None:
        if total_size <= 0:
            reporthook(Report(Report.PROGRESS, "Downloading"))
            return
        read_so_far = round(float(block_num * block_size) / pow(1024, 2), 1)
        rounded_total_size = round(float(total_size) / pow(1024, 2), 1)
        if read_so_far > rounded_total_size:
            read_so_far = rounded_total_size
        reporthook(Report(Report.PROGRESS, "Downloading", ProgressDetails(read_so_far, rounded_total_size, "MB")))

    return download_reporthook
