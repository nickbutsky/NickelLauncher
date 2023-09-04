from typing import Self

from PySide6.QtWidgets import QWidget, QDialog
from PySide6.QtCore import Qt, Signal

from ui.dialoglaunch.ui_dialoglaunch import Ui_DialogLaunch


class DialogLaunch(QDialog):
    closed = Signal()

    def __init__(self, parent: QWidget | None = None):
        super().__init__(parent)
        self.setAttribute(Qt.WidgetAttribute.WA_DeleteOnClose)

        self._ui = Ui_DialogLaunch()
        self._ui.setupUi(self)
        self._setup_signals()

    @property
    def widget(self) -> Self:
        return self

    def spawn_async(self):
        self.setModal(True)
        self.show()

    def set_text(self, text: str):
        self._ui.label.setText(text)

    def set_progressbar_details(self, already_processed: float, total_size: float, unit: str):
        self._ui.progress_bar.setFormat(f'%v/%m {unit}')

        self._ui.progress_bar.setMaximum(total_size)
        self._ui.progress_bar.setValue(already_processed)

    def set_progressbar_undefined(self):
        self._ui.progress_bar.setMaximum(0)

    def _setup_signals(self):
        def close():
            self.closed.emit()
            self.close()

        self._ui.button.clicked.connect(close)
        self.finished.connect(close)
