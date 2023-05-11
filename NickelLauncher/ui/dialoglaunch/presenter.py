from typing import Callable
from typing import Protocol
import logging

from PySide6.QtWidgets import QWidget, QMessageBox
from PySide6.QtCore import QObject, QThread, QTimer, Signal

from report import Report
from ui.functions import show_message_box


class Instance(Protocol):
    def launch(self, reporthook: Callable[[Report], None]): """Raises an Exception on fail"""


class View(Protocol):
    closed: Signal

    @property
    def widget(self) -> QWidget: return ...

    def spawn_async(self): ...

    def close(self): ...

    def set_text(self, text: str): ...

    def set_progressbar_percentage(self, percentage: int): ...

    def set_progressbar_undefined(self): ...


class InstanceLaunchPresenter:
    def __init__(self, view: View, instance: Instance):
        self._view = view
        self._instance = instance

        self._thread = _ThreadLaunchInstance(instance, view.widget.parentWidget())

        self._done_first: QThread | View | None = None

    def run(self):
        self._setup_signals()

        QTimer.singleShot(0, self._thread.start)
        self._view.spawn_async()

    def _refresh_view(self, report: Report):
        if report.type == Report.ERROR:
            self._thread.terminate()
            show_message_box(QMessageBox.Icon.Critical, 'Error', report.text, self._view.widget.parentWidget())
            return

        self._view.set_text(report.text)

        if report.percent == -1:
            self._view.set_progressbar_undefined()
        else:
            self._view.set_progressbar_percentage(report.percent)

    def _on_thread_finished(self):
        if not self._done_first:
            self._done_first = self._thread
        if self._done_first == self._thread:
            self._view.close()

    def _on_view_closed(self):
        if not self._done_first:
            self._done_first = self._view
        if self._done_first == self._view:
            self._thread.terminate()

    def _setup_signals(self):
        self._thread.signal.connect(self._refresh_view)
        self._thread.finished.connect(self._on_thread_finished)
        self._view.closed.connect(self._on_view_closed)


class _ThreadLaunchInstance(QThread):
    signal = Signal(Report)

    def __init__(self, instance: Instance, parent: QObject | None = None):
        super().__init__(parent)

        self._instance = instance

    def run(self):
        try:
            self._instance.launch(self._reporthook)
        except Exception as e:
            logging.error(str(e))
            self._reporthook(Report(Report.ERROR, str(e)))

    def _reporthook(self, report: Report):
        self.signal.emit(report)
