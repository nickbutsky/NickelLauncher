from __future__ import annotations

import logging
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path

from . import bridge, instancemanager
from .env import ROOT


def main(frontend_api: bridge.FrontendAPI) -> None:
    _create_dirs()
    _setup_rotating_logger(ROOT / "logs", "nl")
    bridge.set_frontend_api(frontend_api)
    instancemanager.initialise_watchdog(frontend_api.static.reload_main_area)


def _create_dirs() -> None:
    (ROOT / "versions").mkdir(parents=True, exist_ok=True)
    (ROOT / "instances").mkdir(parents=True, exist_ok=True)
    (ROOT / "logs").mkdir(parents=True, exist_ok=True)


def _setup_rotating_logger(logs_directory: Path, filename_base: str) -> None:
    def namer(name: str) -> str:
        parent_directory_path, filename = os.path.split(name)
        filename = (filename.replace(".log", "") + ".log").lstrip(".")
        return str(Path(parent_directory_path) / filename)

    handler = RotatingFileHandler(
        logs_directory / (filename_base + ".log"),
        maxBytes=1024 * 200,
        backupCount=15,
    )
    handler.namer = namer

    logging.basicConfig(
        format="%(asctime)s | %(threadName)-17s | %(levelname)-5s | %(name)-22s | %(lineno)06d | %(message)s",
        level=logging.DEBUG,
        handlers=[handler] if "__compiled__" in globals() else (handler, logging.StreamHandler()),
    )
