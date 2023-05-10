from typing import Any, Callable, Protocol

from PySide6.QtWidgets import QWidget, QMessageBox
from PySide6.QtCore import Signal

from ui.functions import show_message_box


class InstanceGroup(Protocol):
    @property
    def name(self) -> str: return ...


class InstanceManager(Protocol):
    def get_instance_groups(self) -> list[InstanceGroup]: ...

    def create_instance(self, name: str, group_name: str, version_name: str): ...

    def is_acceptable_instance_name(self, name: str) -> bool: ...


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


class View(Protocol):
    ok: Signal
    version_list_update_requested: Signal

    @property
    def widget(self) -> QWidget: return ...

    def spawn_async(self): ...

    def close(self): ...

    def get_instance_name(self) -> str: ...

    def get_group_name(self) -> str: ...

    def get_version_name(self) -> str: ...

    def set_groups(self, group_names: list[str], default_group_name: str): ...

    def set_version_list(self, versions: list[Version]): ...

    def reset_focus(self): ...


class InstanceCreatePresenter:
    def __init__(self, view: View, instance_manager: InstanceManager, version_supplier: VersionSupplier):
        self._view = view
        self._instance_manager = instance_manager
        self._version_supplier = version_supplier

        self._to_call_on_success: list[Callable[[], Any]] = []

    def run(self):
        self._setup_signals()

        should_show_warning = False
        warning_message = ''
        try:
            self._version_supplier.update_version_list()
        except Exception as e:
            should_show_warning = True
            warning_message = str(e)

        self._set_version_list()
        self._view.spawn_async()

        if should_show_warning:
            show_message_box(QMessageBox.Icon.Warning, 'Error', warning_message, self._view.widget)

    def add_success_callback(self, callback: Callable[[], Any]):
        if callback not in self._to_call_on_success:
            self._to_call_on_success.append(callback)

    def _emit_success(self):
        for function in self._to_call_on_success:
            function()

    def _set_version_list(self):
        self._view.set_groups([group.name for group in self._instance_manager.get_instance_groups()], '')
        self._view.set_version_list(self._version_supplier.get_version_list())

    def _update_version_list(self):
        try:
            self._version_supplier.update_version_list()
        except Exception as e:
            show_message_box(QMessageBox.Icon.Warning, 'Error', str(e), self._view.widget)
        self._set_version_list()

    def _invoke_instance_creation(self):
        name = self._view.get_instance_name()
        group_name = self._view.get_group_name()
        version_name = self._view.get_version_name()

        if not self._instance_manager.is_acceptable_instance_name(name):
            self._view.reset_focus()
            return

        self._instance_manager.create_instance(name, group_name, version_name)

        self._view.close()
        self._emit_success()

    def _setup_signals(self):
        self._view.ok.connect(self._invoke_instance_creation)
        self._view.version_list_update_requested.connect(self._update_version_list)
