from __future__ import annotations

import logging
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path

from .bridge import Bridge, FrontendAPI
from .instancemanager import InstanceManager
from .path import ROOT_DIRECTORY
from .versionretriever import VersionRetriever


def run(frontend_api: FrontendAPI) -> None:
    logs_directory = ROOT_DIRECTORY / "logs"
    _create_dirs(logs_directory)
    _setup_rotating_logger(logs_directory, "nl")
    Bridge.frontend_api = frontend_api
    InstanceManager.initialise_watchdog(frontend_api.static.on_sudden_change)


def _create_dirs(logs_directory: Path) -> None:
    VersionRetriever.DIRECTORY.mkdir(parents=True, exist_ok=True)
    InstanceManager.DIRECTORY.mkdir(parents=True, exist_ok=True)
    logs_directory.mkdir(parents=True, exist_ok=True)


def _setup_rotating_logger(logs_directory: Path, filename_base: str) -> None:
    def namer(name: str) -> str:
        parent_directory_path, filename = os.path.split(name)
        filename = (filename.replace(".log", "") + ".log").lstrip(".")
        return str(Path(parent_directory_path) / filename)

    handler = RotatingFileHandler(logs_directory / (filename_base + ".log"), maxBytes=1024 * 200, backupCount=15)
    handler.namer = namer

    logging.basicConfig(
        format="%(asctime)s | %(threadName)-17s | %(levelname)-5s | %(name)-22s | %(lineno)06d | %(message)s",
        level=logging.DEBUG,
        handlers=[handler] if "__compiled__" in globals() else (handler, logging.StreamHandler()),
    )
