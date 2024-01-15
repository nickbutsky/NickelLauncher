from os import PathLike
from pathlib import Path


class UserPath(type(Path())):
    def __truediv__(self, key: str | PathLike[str]) -> Path:
        return Path(super().__truediv__(key))
