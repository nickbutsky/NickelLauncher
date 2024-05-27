from __future__ import annotations

import logging
import time
from typing import TYPE_CHECKING

from watchdog.events import DirCreatedEvent, DirMovedEvent, FileDeletedEvent, FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer

if TYPE_CHECKING:
    from pathlib import Path
    from typing import Callable


class Watchdog:
    def __init__(self, directory: Path, callback: Callable[[], object]) -> None:
        super().__init__()
        self._directory = directory
        self._event_handler = _EventHandler(callback)

    @property
    def tracking_dir_created_event(self) -> bool:
        return not self._event_handler.ignore_dir_created_event

    def toggle_dir_created_event_tracking(self) -> None:
        self._event_handler.ignore_dir_created_event = not self._event_handler.ignore_dir_created_event

    def run(self) -> None:
        observer = Observer()
        observer.schedule(self._event_handler, str(self._directory))  # pyright: ignore [reportUnknownMemberType]
        observer.start()
        logging.debug("Watchdog thread started.")


class _EventHandler(FileSystemEventHandler):
    def __init__(self, callback: Callable[[], object]) -> None:
        super().__init__()
        self.ignore_dir_created_event = False
        self._callback = callback

    def on_any_event(self, event: FileSystemEvent) -> None:
        if isinstance(
            event,
            (
                FileDeletedEvent,
                DirMovedEvent if self.ignore_dir_created_event else DirCreatedEvent,
                FileDeletedEvent,
                DirMovedEvent,
            ),
        ):
            logging.debug(str(event))
            time.sleep(0.25)
            self._callback()
