from typing import Any, Callable
from urllib.request import urlretrieve

from report import Report


class Downloader:
    def __init__(self, reporthook: Callable[[Report], Any] | None = None):
        self.reporthook = reporthook

    def download_file(self, url: str, destination: str):
        if self.reporthook:
            urlretrieve(url, destination, self._local_reporthook)
        else:
            urlretrieve(url, destination)

    def _local_reporthook(self, block_num: int, block_size: int, total_size: int):
        read_so_far = block_num * block_size
        if total_size > 0:
            percent = read_so_far * 100 / total_size
            self.reporthook(Report(Report.PROGRESS, 'Downloading', int(percent)))
        else:
            self.reporthook(Report(Report.PROGRESS, 'Downloading'))
