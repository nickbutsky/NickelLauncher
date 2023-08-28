from typing import Any, Callable
from urllib.request import urlretrieve

from report import Report, ProgressDetails


class Downloader:
    def __init__(self, reporthook: Callable[[Report], Any] | None = None):
        self.reporthook = reporthook

    def download_file(self, url: str, destination: str):
        if self.reporthook:
            urlretrieve(url, destination, self._local_reporthook)
        else:
            urlretrieve(url, destination)

    def _local_reporthook(self, block_num: int, block_size: int, total_size: int):
        if total_size <= 0:
            self.reporthook(Report(Report.PROGRESS, 'Downloading'))
            return

        read_so_far = round(float(block_num * block_size) / pow(1024, 2), 1)
        total_size = round(float(total_size) / pow(1024, 2), 1)

        if read_so_far > total_size:
            read_so_far = total_size

        self.reporthook(Report(Report.PROGRESS, 'Downloading', ProgressDetails(read_so_far, total_size, 'MB')))
        print(f'{read_so_far, total_size}')
