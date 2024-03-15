from typing import Any, Callable, Protocol

from PySide6.QtCore import Signal


class Instance(Protocol):
    ...


class InstanceGroup(Protocol):
    @property
    def name(self) -> str: return ...

    @property
    def instances(self) -> list[Instance]: return ...


class GroupManager(Protocol):
    def get_instance_groups(self) -> list[InstanceGroup]: ...

    def change_instance_group(self, instance: Instance, group_name: str): ...


class View(Protocol):
    ok: Signal

    def spawn_async(self): ...

    def close(self): ...

    def get_group_name(self) -> str: ...

    def set_group_names(self, names: list[str]): ...

    def set_current_group_name(self, name: str): ...


class GroupChangePresenter:
    def __init__(self, view: View, group_manager: GroupManager, instance: Instance):
        self._view = view
        self._group_manager = group_manager
        self._instance = instance

        self._to_call_on_success: list[Callable[[], Any]] = []

    def run(self):
        self._setup_signals()

        group_names = []
        current_group_name = ''
        for group in self._group_manager.get_instance_groups():
            group_names.append(group.name)
            if self._instance in group.instances:
                current_group_name = group.name

        self._view.set_group_names(group_names)
        self._view.set_current_group_name(current_group_name)
        self._view.spawn_async()

    def add_success_callback(self, callback: Callable[[], Any]):
        if callback not in self._to_call_on_success:
            self._to_call_on_success.append(callback)

    def _on_done(self):
        self._view.close()
        self._group_manager.change_instance_group(self._instance, self._view.get_group_name())
        self._emit_success()

    def _emit_success(self):
        for function in self._to_call_on_success:
            function()

    def _setup_signals(self):
        self._view.ok.connect(self._on_done)
