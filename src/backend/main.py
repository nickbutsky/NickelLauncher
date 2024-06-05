from __future__ import annotations

import logging
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path

import bridge
import instancemanager
from env import ROOT


def main(*args: object, **kwargs: object) -> None:
    frontend_api = kwargs["frontend_api"]
    if not isinstance(frontend_api, bridge.FrontendAPI):
        error_msg = f"Invalid args {args}, {kwargs}."
        raise TypeError(error_msg)

    _create_dirs()
    _setup_rotating_logger(ROOT / "logs", "nl")
    bridge.set_frontend_api(frontend_api)
    instancemanager.initialise_watchdog(frontend_api.static.reload_main_area)


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


if __name__ == "__main__":
    main()
