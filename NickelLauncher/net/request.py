from typing import Any, Callable
from pathlib import Path
from urllib import request

from report import Report, ProgressDetails


def download_file(url: str, destination: Path, reporthook: Callable[[Report], Any] | None = None):
    request.urlretrieve(url, destination, _download_reporthook_wrapper(reporthook) if reporthook else None)


def _download_reporthook_wrapper(reporthook: Callable[[Report], Any]) -> Callable[[int, int, int], Any]:
    def download_reporthook(block_num: int, block_size: int, total_size: int):
        if total_size <= 0:
            reporthook(Report(Report.PROGRESS, 'Downloading'))
            return
        read_so_far = round(float(block_num * block_size) / pow(1024, 2), 1)
        rounded_total_size = round(float(total_size) / pow(1024, 2), 1)
        if read_so_far > rounded_total_size:
            read_so_far = rounded_total_size
        reporthook(Report(Report.PROGRESS, 'Downloading', ProgressDetails(read_so_far, rounded_total_size, 'MB')))
    return download_reporthook
