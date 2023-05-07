from typing import Protocol

from PySide6.QtWidgets import QWidget

from ui.custom.expandablewidget import ExpandableWidget
from ui.custom.flowlayout import FlowLayout
from ui.instanceview.components.buttoninstance import ButtonInstance, Instance


class InstanceGroup(Protocol):
    @property
    def name(self) -> str: return ...

    @property
    def hidden(self) -> bool: return ...

    @property
    def instances(self) -> list[Instance]: return ...


class VisualInstanceGroup(ExpandableWidget):
    def __init__(self, instance_group: InstanceGroup, parent: QWidget | None = None):
        super().__init__(instance_group.name, parent)

        self._group = instance_group
        self._instance_buttons: list[ButtonInstance] = []

        self._setup_ui()

    @property
    def instance_buttons(self) -> list[ButtonInstance]:
        return self._instance_buttons

    def _setup_ui(self):
        widget = QWidget(self)
        widget.setLayout(FlowLayout(widget))

        widget.layout().setContentsMargins(0, 0, 0, 0)

        for instance in self._group.instances:
            button_instance = ButtonInstance(instance, self)

            widget.layout().addWidget(button_instance)
            self._instance_buttons.append(button_instance)

        self.set_widget(widget)

        if not self._group.hidden:
            self.click()
