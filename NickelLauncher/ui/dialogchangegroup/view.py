from PySide6.QtWidgets import QWidget, QDialog
from PySide6.QtCore import Qt, Signal

from ui.dialogchangegroup.ui_dialogchangegroup import Ui_DialogChangeGroup


class DialogChangeGroup(QDialog):
    ok = Signal()

    def __init__(self, parent: QWidget | None = None):
        super().__init__(parent)
        self.setAttribute(Qt.WidgetAttribute.WA_DeleteOnClose)

        self._ui = Ui_DialogChangeGroup()

        self._ui.setupUi(self)
        self._setup_signals()

    def spawn_async(self):
        self.setModal(True)
        self.show()

    def get_group_name(self) -> str:
        return self._ui.combo_box.currentText()

    def set_group_names(self, names: list[str]):
        self._ui.combo_box.addItems(names)

    def set_current_group_name(self, name: str):
        self._ui.combo_box.setCurrentText(name)

    def _setup_signals(self):
        self._ui.dialog_button_box.accepted.connect(self.ok.emit)
        self._ui.dialog_button_box.rejected.connect(self.reject)
