from __future__ import annotations

import os
import sys
from pathlib import Path


def _get_root() -> Path | None:
    if "__compiled__" not in globals():
        return Path.home() / "Test Directories" / "NickelLauncher"
    appdata_path = os.getenv("APPDATA")
    return Path(appdata_path) / "NickelLauncher" if appdata_path else None


_root = _get_root()
if not _root:
    sys.exit(-1)
ROOT = _root
