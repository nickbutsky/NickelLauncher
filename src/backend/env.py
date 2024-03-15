import os
from pathlib import Path
import sys


def _get_root() -> Path | None:
    if "__compiled__" not in globals():
        return Path.home() / "Test Directories" / "NickelLauncher"
    _appdata_path = os.getenv("APPDATA")
    return Path(_appdata_path) / "NickelLauncher" if _appdata_path else None


_root = _get_root()
if not _root:
    sys.exit(-1)
ROOT = _root
