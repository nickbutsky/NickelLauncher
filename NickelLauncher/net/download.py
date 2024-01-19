from typing import Any, Callable
from pathlib import Path
from urllib import request

from report import Report, ProgressDetails


def download_file(url: str, destination: Path, reporthook: Callable[[Report], Any] | None = None):
    def _local_reporthook(block_num: int, block_size: int, total_size: int):
        if total_size <= 0:
            reporthook(Report(Report.PROGRESS, 'Downloading'))
            return
        read_so_far = round(float(block_num * block_size) / pow(1024, 2), 1)
        total_size = round(float(total_size) / pow(1024, 2), 1)
        if read_so_far > total_size:
            read_so_far = total_size
        reporthook(Report(Report.PROGRESS, 'Downloading', ProgressDetails(read_so_far, total_size, 'MB')))

    request.urlretrieve(url, destination, _local_reporthook if reporthook else None)
