from __future__ import annotations

import logging
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import TYPE_CHECKING

import instancemanager
from env import ROOT

if TYPE_CHECKING:
    from bridge import FrontendAPI


def run(frontend_api: FrontendAPI) -> None:
    _create_dirs()
    _setup_rotating_logger(ROOT / "logs", "nl")
    instancemanager.initialise_watchdog(frontend_api.reload_main_area)


def _create_dirs() -> None:
    (ROOT / "versions").mkdir(parents=True, exist_ok=True)
    (ROOT / "instances").mkdir(parents=True, exist_ok=True)
    (ROOT / "temp").mkdir(parents=True, exist_ok=True)
    (ROOT / "logs").mkdir(parents=True, exist_ok=True)


def _setup_rotating_logger(logs_directory: Path, filename_base: str) -> None:
    def namer(name: str) -> str:
        parent_directory_path, filename = os.path.split(name)
        filename = (filename.replace(".log", "") + ".log").lstrip(".")
        return str(Path(parent_directory_path) / filename)

    handler = RotatingFileHandler(
        str(logs_directory / (filename_base + ".log")),
        maxBytes=1024 * 200,
        backupCount=15,
    )
    handler.namer = namer

    logging.basicConfig(
        format="%(asctime)s | %(threadName)-10s | %(levelname)-5s | %(name)-22s | %(lineno)06d | %(message)s",
        level=logging.DEBUG,
        handlers=[handler],
    )
