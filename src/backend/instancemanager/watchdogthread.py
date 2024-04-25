from __future__ import annotations

import logging
import time
from typing import TYPE_CHECKING

from PySide6.QtCore import QThread, Signal
from watchdog.events import DirCreatedEvent, DirMovedEvent, FileDeletedEvent, FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer

if TYPE_CHECKING:
    from pathlib import Path
    from typing import Callable


class WatchdogThread(QThread):
    changed = Signal()

    def __init__(self, directory: Path):
        super().__init__()

        self._ignore_dir_created_event = False

        self._directory = directory

        self._event_handler = _EventHandler(self._callback)

    @property
    def ignore_dir_created_event(self) -> bool:
        return self._ignore_dir_created_event

    @ignore_dir_created_event.setter
    def ignore_dir_created_event(self, ignore: bool):
        self._event_handler.ignore_dir_created_event = ignore
        self._ignore_dir_created_event = ignore

    def run(self):
        observer = Observer()
        observer.schedule(self._event_handler, str(self._directory))
        observer.start()
        logging.debug("Watchdog thread started.")

    def _callback(self):
        self.changed.emit()


class _EventHandler(FileSystemEventHandler):
    def __init__(self, callback: Callable[[], object]):
        super().__init__()

        self.ignore_dir_created_event = False

        self._callback = callback

    def on_any_event(self, event: FileSystemEvent):
        if self.ignore_dir_created_event:
            event_types = FileDeletedEvent, DirMovedEvent
        else:
            event_types = DirCreatedEvent, FileDeletedEvent, DirMovedEvent

        if isinstance(event, event_types):
            logging.debug(str(event))
            time.sleep(0.25)
            self._callback()
