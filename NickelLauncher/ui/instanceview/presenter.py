from typing import Any, Callable, Protocol

from PySide6.QtWidgets import QWidget
from PySide6.QtCore import Signal

import managers.versionmanager as version_manager
from ui.dialognewinstance.view import DialogNewInstance
from ui.dialognewinstance.presenter import InstanceCreatePresenter
from ui.dialoglaunch.view import DialogLaunch
from ui.dialoglaunch.presenter import InstanceLaunchPresenter
from ui.dialogchangegroup.view import DialogChangeGroup
from ui.dialogchangegroup.presenter import GroupChangePresenter
from ui.dialogchangeversion.view import DialogChangeVersion
from ui.dialogchangeversion.presenter import VersionChangePresenter


class Instance(Protocol):
    @property
    def name(self) -> str: return ...

    @property
    def version_name(self) -> str: return ...

    @property
    def architecture_choice(self) -> str: return ...

    @property
    def available_version_architectures(self) -> str: return ...

    @property
    def path(self) -> str: return ...

    @property
    def minecraft_dir_path(self) -> str: return ...

    def rename(self, new_name: str): ...

    def change_version(self, version_name: str): ...

    def set_architecture_choice(self, architecture: str): ...

    def launch(self): ...


class InstanceGroup(Protocol):
    @property
    def name(self) -> str: return ...

    @property
    def hidden(self) -> bool: return ...

    @property
    def instances(self) -> list[Instance]: return ...


class Model(Protocol):
    def create_instance(self, name: str, group_name: str, version_name: str): ...

    def get_instance_groups(self) -> list[InstanceGroup]: ...

    def get_last_instance(self) -> Instance | None: ...

    def set_last_instance(self, instance: Instance): ...

    def set_group_hidden(self, name: str, hidden: bool): ...

    def change_instance_group(self, instance: Instance, group_name: str): ...

    def subscribe_to_state_change_notifications(self, callback: Callable[[], Any]): ...


class View(Protocol):
    changed_focus: Signal
    launch_requested: Signal

    architecture_change_requested: Signal
    rename_requested: Signal
    change_group_requested: Signal
    change_version_requested: Signal
    group_expanded: Signal
    group_collapsed: Signal

    @property
    def widget(self) -> QWidget: return ...

    @property
    def current_instance_representation(self) -> QWidget: return ...

    @property
    def current_instance(self) -> Instance: return ...

    def clear(self): ...

    def show_instance_groups(self, instance_groups: list[InstanceGroup]): ...

    def select_instance(self, instance: Instance): ...

    def update_instance_representation(self, instance: Instance): ...


class InstanceViewPresenter:
    def __init__(self, view: View, model: Model):
        self._view = view
        self._model = model

        self._instance_create_presenter: InstanceCreatePresenter | None = None
        self._instance_launch_presenter: InstanceLaunchPresenter | None = None
        self._group_change_presenter: GroupChangePresenter | None = None
        self._version_change_presenter: VersionChangePresenter | None = None

    def run(self):
        self._setup_signals()
        self._reload_view()
        self._model.subscribe_to_state_change_notifications(self._reload_view)

    def show_instance_creation_dialog(self):
        self._instance_create_presenter = InstanceCreatePresenter(
            DialogNewInstance(self._view.widget), self._model, version_manager  # PY-58679
        )
        self._instance_create_presenter.add_success_callback(self._reload_view)
        self._instance_create_presenter.run()

    def _reload_view(self):
        self._view.clear()
        self._view.show_instance_groups(self._model.get_instance_groups())

        last_instance = self._model.get_last_instance()
        if last_instance:
            self._view.select_instance(last_instance)

    def _on_changed_focus(self):
        self._model.set_last_instance(self._view.current_instance)

    def _on_launch_requested(self):
        self._instance_launch_presenter = InstanceLaunchPresenter(
            DialogLaunch(self._view.current_instance_representation), self._view.current_instance
        )
        self._instance_launch_presenter.run()

    def _on_architecture_change_requested(self, architecture: str):
        self._view.current_instance.set_architecture_choice(architecture)

    def _on_rename_requested(self, new_name: str):
        self._view.current_instance.rename(new_name)
        self._view.update_instance_representation(self._view.current_instance)

    def _on_change_group_requested(self):
        self._group_change_presenter = GroupChangePresenter(
            DialogChangeGroup(self._view.current_instance_representation), self._model, self._view.current_instance
        )
        self._group_change_presenter.add_success_callback(self._reload_view)
        self._group_change_presenter.run()

    def _on_change_version_requested(self):
        self._version_change_presenter = VersionChangePresenter(
            DialogChangeVersion(self._view.current_instance_representation),
            version_manager,  # PY-58679
            self._view.current_instance
        )
        self._version_change_presenter.add_success_callback(
            lambda: self._view.update_instance_representation(self._view.current_instance)
        )
        self._version_change_presenter.run()

    def _on_group_expanded(self, group_name: str):
        self._model.set_group_hidden(group_name, False)

    def _on_group_collapsed(self, group_name: str):
        self._model.set_group_hidden(group_name, True)

    def _setup_signals(self):
        self._view.changed_focus.connect(self._on_changed_focus)
        self._view.launch_requested.connect(self._on_launch_requested)
        self._view.architecture_change_requested.connect(self._on_architecture_change_requested)
        self._view.rename_requested.connect(self._on_rename_requested)
        self._view.change_group_requested.connect(self._on_change_group_requested)
        self._view.change_version_requested.connect(self._on_change_version_requested)
        self._view.group_expanded.connect(self._on_group_expanded)
        self._view.group_collapsed.connect(self._on_group_collapsed)
