from typing import Any, Callable
import time
import logging

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileSystemEvent, DirCreatedEvent, FileDeletedEvent, DirMovedEvent
from PySide6.QtCore import QThread, Signal


class WatchdogThread(QThread):
    changed = Signal()

    def __init__(self, instances_dir_path: str):
        super().__init__()

        self._ignore_dir_created_event = False

        self._instances_dir_path = instances_dir_path

        self._instances_dir_event_handler = _InstancesDirEventHandler(self._callback)

    @property
    def ignore_dir_created_event(self) -> bool:
        return self._ignore_dir_created_event

    @ignore_dir_created_event.setter
    def ignore_dir_created_event(self, ignore: bool):
        self._instances_dir_event_handler.ignore_dir_created_event = ignore
        self._ignore_dir_created_event = ignore

    def run(self):
        observer = Observer()
        observer.schedule(self._instances_dir_event_handler, self._instances_dir_path)
        observer.start()
        logging.debug('Watchdog thread started.')

    def _callback(self):
        self.changed.emit()


class _InstancesDirEventHandler(FileSystemEventHandler):
    def __init__(self, callback: Callable[[], Any]):
        super().__init__()

        self.ignore_dir_created_event = False

        self._callback = callback

    def on_any_event(self, event: FileSystemEvent):
        if self.ignore_dir_created_event:
            event_types = (FileDeletedEvent, DirMovedEvent)
        else:
            event_types = (DirCreatedEvent, FileDeletedEvent, DirMovedEvent)

        if isinstance(event, event_types):
            logging.debug(str(event))
            time.sleep(0.25)
            self._callback()
