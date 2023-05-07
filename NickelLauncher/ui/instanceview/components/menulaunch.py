from typing import Protocol

from PySide6.QtWidgets import QWidget, QMenu
from PySide6.QtCore import QObject, Signal
from PySide6.QtGui import QAction, QActionGroup


class Instance(Protocol):
    @property
    def architecture_choice(self) -> str: return ...

    @property
    def available_version_architectures(self) -> str: return ...


class MenuLaunch(QMenu):
    launch_requested = Signal()
    architecture_change_requested = Signal(str)

    def __init__(self, instance: Instance, parent: QWidget | None = None):
        super().__init__('Launch', parent)

        self._instance = instance

        self.aboutToShow.connect(self._show)

    def _show(self):
        self.clear()

        action_launch = QAction('Launch', self)
        action_launch.triggered.connect(self.launch_requested.emit)
        self.addAction(action_launch)

        self.addSeparator()

        group_architecture_choices = _ActionGroupArchitectureChoices(self._instance, self)
        group_architecture_choices.architecture_change_requested.connect(self.architecture_change_requested.emit)
        self.addActions(group_architecture_choices.actions())


class _ActionGroupArchitectureChoices(QActionGroup):
    architecture_change_requested = Signal(str)

    def __init__(self, instance: Instance, parent: QObject):
        super().__init__(parent)
        self.setExclusive(True)

        self._instance = instance

        self._setup()

    def _setup(self):
        for architecture in self._instance.available_version_architectures:
            action = QAction(architecture, self)
            action.setCheckable(True)

            if architecture == self._instance.architecture_choice:
                action.setChecked(True)

            action.triggered.connect(self._on_architecture_choice_change_requested)

            self.addAction(action)

    def _on_architecture_choice_change_requested(self):
        self.architecture_change_requested.emit(self.checkedAction().text())
