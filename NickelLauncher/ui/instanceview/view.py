from typing import Self

from PySide6.QtWidgets import QWidget, QButtonGroup
from PySide6.QtCore import Signal

from ui.functions import ensure_widget_visible
from ui.custom.scrollarea import ScrollArea
from ui.instanceview.components.visualinstancegroup import VisualInstanceGroup, InstanceGroup
from ui.instanceview.components.buttoninstance import ButtonInstance, Instance


class InstanceView(ScrollArea):
    changed_focus = Signal()
    launch_requested = Signal()
    architecture_change_requested = Signal(str)
    rename_requested = Signal(str)
    change_group_requested = Signal()
    change_version_requested = Signal()
    copy_requested = Signal()
    group_expanded = Signal(str)
    group_collapsed = Signal(str)

    def __init__(self, parent: QWidget | None = None):
        super().__init__(parent)

        self._visual_instance_groups: list[VisualInstanceGroup] = []

        self._button_instance_group = QButtonGroup(self)
        self._button_instance_group.setExclusive(True)

    @property
    def widget(self) -> Self:
        return self

    @property
    def current_instance_representation(self) -> ButtonInstance:
        return self._button_instance_group.checkedButton()

    @property
    def current_instance(self) -> Instance:
        return self.current_instance_representation.instance

    def select_instance(self, instance: Instance):
        button = self._get_button_instance(instance)
        button.setChecked(True)
        for visual_instance_group in self._visual_instance_groups:
            if button in visual_instance_group.instance_buttons and not visual_instance_group.is_expanded:
                visual_instance_group.click()
                break

        ensure_widget_visible(self, button)

    def show_instance_groups(self, instance_groups: list[InstanceGroup]):
        for group in instance_groups:
            visual_instance_group = VisualInstanceGroup(group, self)
            self.add_widget(visual_instance_group)

            for button in visual_instance_group.instance_buttons:
                self._button_instance_group.addButton(button)

            self._visual_instance_groups.append(visual_instance_group)

        for group in self._visual_instance_groups:
            self._setup_signals(group)

    def update_instance_representation(self, instance: Instance):
        self._get_button_instance(instance).reload()

    def clear(self):
        self._visual_instance_groups.clear()
        buttons_to_delete = [button for button in self._button_instance_group.buttons()]
        for button in buttons_to_delete:
            self._button_instance_group.removeButton(button)
            button.deleteLater()
        super().clear()

    def _get_button_instance(self, instance: Instance) -> ButtonInstance:
        for button in self._button_instance_group.buttons():
            if button.instance == instance:
                return button

    def _setup_signals(self, visual_instance_group: VisualInstanceGroup):
        visual_instance_group.expanded.connect(self.group_expanded.emit)
        visual_instance_group.collapsed.connect(self.group_collapsed.emit)

        for button_instance in visual_instance_group.instance_buttons:
            button_instance.clicked.connect(self.changed_focus.emit)
            button_instance.launch_requested.connect(self.launch_requested.emit)
            button_instance.architecture_change_requested.connect(self.architecture_change_requested.emit)
            button_instance.rename_requested.connect(self.rename_requested.emit)
            button_instance.change_group_requested.connect(self.change_group_requested.emit)
            button_instance.change_version_requested.connect(self.change_version_requested.emit)
            button_instance.copy_requested.connect(self.copy_requested.emit)
