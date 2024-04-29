from __future__ import annotations

import logging
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path

from env import ROOT


def setup() -> None:
    _create_dirs()
    _setup_rotating_logger(ROOT / "logs", "nl")


def _create_dirs() -> None:
    (ROOT / "versions").mkdir(parents=True)
    (ROOT / "instances").mkdir(parents=True)
    (ROOT / "temp").mkdir(parents=True)
    (ROOT / "logs").mkdir(parents=True)


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
