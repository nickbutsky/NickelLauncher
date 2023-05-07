from typing import Protocol
import os

from PySide6.QtWidgets import QWidget, QToolButton, QLabel, QMenu, QGridLayout
from PySide6.QtCore import Qt, QPoint, QUrl, Signal
from PySide6.QtGui import QAction, QPixmap, QMouseEvent, QDesktopServices

from ui import resources
from ui.custom.editablelabel import EditableLabel
from ui.instanceview.components.menulaunch import MenuLaunch


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


class ButtonInstance(QToolButton):
    launch_requested = Signal()
    architecture_change_requested = Signal(str)
    rename_requested = Signal(str)
    change_group_requested = Signal()
    change_version_requested = Signal()

    def __init__(self, instance: Instance, parent: QWidget | None = None):
        super().__init__(parent)

        self._instance = instance

        self._label_name = EditableLabel(instance.name, self)
        self._label_version_name = QLabel(instance.version_name, self)

        self._setup_ui()
        self._setup_signals()

    @property
    def instance(self) -> Instance:
        return self._instance

    def mouseDoubleClickEvent(self, a0: QMouseEvent):
        if self.isChecked():
            self.launch_requested.emit()

    def reload(self):
        old_label_name = self._label_name
        self._label_name = EditableLabel(self.instance.name, self)
        self.layout().replaceWidget(old_label_name, self._label_name)
        old_label_name.deleteLater()

        old_label_version_name = self._label_version_name
        self._label_version_name = QLabel(self.instance.version_name, self)
        self._label_version_name.setFixedWidth(249)
        self.layout().replaceWidget(old_label_version_name, self._label_version_name)
        old_label_version_name.deleteLater()

        self._label_name.editing_finished.connect(self.rename_requested.emit)

    def _on_context_menu_requested(self, point: QPoint):
        if self.isChecked():
            popup_menu = _PopupMenu(self.instance, self)
            popup_menu.launch_requested.connect(self.launch_requested.emit)
            popup_menu.architecture_change_requested.connect(self.architecture_change_requested.emit)
            popup_menu.rename_requested.connect(self._label_name.enter_editing_mode)
            popup_menu.change_group_requested.connect(self.change_group_requested.emit)
            popup_menu.change_version_requested.connect(self.change_version_requested.emit)

            popup_menu.popup(self.mapToGlobal(point))

    def _setup_ui(self):
        self.setCheckable(True)
        self.setContextMenuPolicy(Qt.ContextMenuPolicy.CustomContextMenu)

        width, height = 249, 66
        self.setFixedSize(width, height)

        layout = QGridLayout(self)
        self.setLayout(layout)
        layout.setContentsMargins(4, 4, 4, 4)

        label_icon = QLabel(self)
        label_icon.setPixmap(QPixmap(os.path.join(':', 'icons', 'default.png')).scaled(48, 48))
        layout.addWidget(label_icon, 0, 0, 2, 1)

        layout.addWidget(self._label_name, 0, 1, 1, 1)

        self._label_version_name.setFixedWidth(width)
        layout.addWidget(self._label_version_name, 1, 1, 1, 1)

    def _setup_signals(self):
        self.customContextMenuRequested.connect(self._on_context_menu_requested)
        self._label_name.editing_finished.connect(self.rename_requested.emit)


class _PopupMenu(QMenu):
    launch_requested = Signal()
    architecture_change_requested = Signal(str)
    rename_requested = Signal()
    change_group_requested = Signal()
    change_version_requested = Signal()

    def __init__(self, instance: Instance, parent: QWidget | None = None):
        super().__init__(parent)
        self.setAttribute(Qt.WidgetAttribute.WA_DeleteOnClose)

        menu_launch = MenuLaunch(instance, self)
        menu_launch.launch_requested.connect(self.launch_requested.emit)
        menu_launch.architecture_change_requested.connect(self.architecture_change_requested.emit)
        self.addMenu(menu_launch)

        self.addSeparator()

        action_rename = QAction('Rename', self)
        action_rename.triggered.connect(self.rename_requested.emit)
        self.addAction(action_rename)

        action_change_group = QAction('Change Group', self)
        action_change_group.triggered.connect(self.change_group_requested.emit)
        self.addAction(action_change_group)

        action_change_version = QAction('Change Version', self)
        action_change_version.triggered.connect(self.change_version_requested.emit)
        self.addAction(action_change_version)

        self.addSeparator()

        action_open_minecraft_folder = QAction('Minecraft Folder', self)
        def open_minecraft_folder(): QDesktopServices.openUrl(QUrl.fromLocalFile(instance.minecraft_dir_path))
        action_open_minecraft_folder.triggered.connect(open_minecraft_folder)
        self.addAction(action_open_minecraft_folder)

        action_open_instance_folder = QAction('Instance Folder', self)
        def open_instance_folder(): QDesktopServices.openUrl(QUrl.fromLocalFile(instance.path))
        action_open_instance_folder.triggered.connect(open_instance_folder)
        self.addAction(action_open_instance_folder)
