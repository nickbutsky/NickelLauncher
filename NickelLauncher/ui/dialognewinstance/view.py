from typing import Self

from PySide6.QtWidgets import QWidget, QDialog
from PySide6.QtCore import Qt, Signal

from ui.dialognewinstance.ui_dialognewinstance import Ui_DialogNewInstance
from ui.versionselectionview.versionselectionview import VersionSelectionView, Version


class DialogNewInstance(QDialog):
    ok = Signal()
    version_list_update_requested = Signal()

    def __init__(self, parent: QWidget | None = None):
        super().__init__(parent)
        self.setAttribute(Qt.WidgetAttribute.WA_DeleteOnClose)

        self._version_selection_view = VersionSelectionView(self)

        self._ui = Ui_DialogNewInstance()
        self._setup_ui()
        self._setup_signals()

    @property
    def widget(self) -> Self:
        return self

    def spawn_async(self):
        self.setModal(True)
        self.show()

    def get_instance_name(self) -> str:
        return self._ui.edit_name.text() or self._ui.edit_name.placeholderText()

    def get_group_name(self) -> str:
        return self._ui.combo_box_group.currentText()

    def get_version_name(self) -> str:
        return self._version_selection_view.get_version_name()

    def set_groups(self, group_names: list[str], default_group_name: str):
        self._ui.combo_box_group.clear()
        self._ui.combo_box_group.lineEdit().setPlaceholderText('No Group')
        self._ui.combo_box_group.addItems(group_names)
        self._ui.combo_box_group.setCurrentText(default_group_name)

    def set_version_list(self, versions: list[Version]):
        self._version_selection_view.set_version_list(versions)

    def reset_focus(self):
        self._ui.edit_name.setFocus()

    def _update_instance_name_placeholder(self):
        self._ui.edit_name.setPlaceholderText(self.get_version_name())

    def _setup_ui(self):
        self._ui.setupUi(self)

        self._ui.vertical_layout.insertWidget(1, self._version_selection_view)

        self.reset_focus()

    def _setup_signals(self):
        self._version_selection_view.version_picked.connect(self._update_instance_name_placeholder)

        self._version_selection_view.version_list_update_requested.connect(self.version_list_update_requested.emit)

        self._ui.button_box.accepted.connect(self.ok.emit)
        self._ui.button_box.rejected.connect(self.reject)
