from __future__ import annotations

import os
import sys
from pathlib import Path

_root = (
    (Path(appdata_path) / "NickelLauncher" if (appdata_path := os.getenv("APPDATA")) else None)
    if "__compiled__" in globals()
    else Path.home() / "Test Directories" / "NickelLauncher"
)
if not _root:
    sys.exit(-1)
ROOT_DIRECTORY = _root
