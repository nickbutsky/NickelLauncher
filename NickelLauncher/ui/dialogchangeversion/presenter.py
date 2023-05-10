from typing import Any, Callable, Protocol

from PySide6.QtWidgets import QWidget, QMessageBox
from PySide6.QtCore import Signal

from ui.functions import show_message_box


class Version(Protocol):
    @property
    def name(self) -> str: return ...

    @property
    def architecture(self) -> str: return ...

    @property
    def type(self) -> str: return ...


class VersionSupplier(Protocol):
    def get_version_list(self) -> list[Version]: ...

    def update_version_list(self): """Raises an Exception on fail"""


class Instance(Protocol):
    @property
    def version_name(self) -> str: return ...

    def change_version(self, version_name: str): ...


class View(Protocol):
    ok: Signal
    version_list_update_requested: Signal

    @property
    def widget(self) -> QWidget: return ...

    def spawn_async(self): ...

    def close(self): ...

    def get_version_name(self) -> str: ...

    def select_version(self, name: str): ...

    def set_version_list(self, versions: list[Version]): ...


class VersionChangePresenter:
    def __init__(self, view: View, version_supplier: VersionSupplier, instance: Instance):
        self._view = view
        self._version_supplier = version_supplier
        self._instance = instance

        self._to_call_on_success: list[Callable[[], Any]] = []

    def run(self):
        self._setup_signals()

        self._view.set_version_list(self._version_supplier.get_version_list())
        self._view.select_version(self._instance.version_name)
        self._view.spawn_async()

    def add_success_callback(self, callback: Callable[[], Any]):
        if callback not in self._to_call_on_success:
            self._to_call_on_success.append(callback)

    def _emit_success(self):
        for function in self._to_call_on_success:
            function()

    def _update_version_list(self):
        try:
            self._version_supplier.update_version_list()
        except Exception as e:
            show_message_box(QMessageBox.Icon.Warning, 'Error', str(e), self._view.widget)
        self._view.set_version_list(self._version_supplier.get_version_list())

    def _on_done(self):
        self._instance.change_version(self._view.get_version_name())
        self._view.close()
        self._emit_success()

    def _setup_signals(self):
        self._view.ok.connect(self._on_done)
        self._view.version_list_update_requested.connect(self._update_version_list)
