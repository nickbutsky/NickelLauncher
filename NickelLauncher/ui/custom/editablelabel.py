from PySide6.QtWidgets import QWidget, QLabel, QLineEdit, QHBoxLayout
from PySide6.QtCore import Qt, QEvent, Signal
from PySide6.QtGui import QFocusEvent, QKeyEvent


class EditableLabel(QWidget):
    editing_finished = Signal(str)

    def __init__(self, text: str, parent: QWidget | None = None):
        super().__init__(parent)

        self._in_editing_mode = False

        self._label = QLabel(text, self)
        self._line_edit = _LineEdit(text, self)

        self.__setup()

    def enter_editing_mode(self):
        if self._in_editing_mode:
            return

        self._in_editing_mode = True

        self._line_edit.setText(self._label.text())

        self._line_edit.setVisible(True)
        self._label.setVisible(False)

        self._line_edit.setFocus()

    def exit_editing_mode(self, accept_changes: bool = False):
        if not self._in_editing_mode:
            return

        self._in_editing_mode = False

        if accept_changes:
            self._label.setText(self._line_edit.text())

        self._label.setVisible(True)
        self._line_edit.setVisible(False)

    def __setup(self):
        self.setLayout(QHBoxLayout(self))
        self.layout().setContentsMargins(0, 0, 0, 0)

        self.layout().addWidget(self._label)
        self.layout().addWidget(self._line_edit)

        self._line_edit.setVisible(False)

        self._line_edit.editing_finished.connect(self.editing_finished)
        self._line_edit.lost_focus.connect(self.exit_editing_mode)


class _LineEdit(QLineEdit):
    editing_finished = Signal(str)
    lost_focus = Signal()

    def __init__(self, text: str, parent: QWidget | None = None):
        super().__init__(text, parent)
        self.setFrame(False)

        self._initial_text = text

    def keyPressEvent(self, a0: QKeyEvent):
        if a0.key() in (Qt.Key.Key_Enter, Qt.Key.Key_Return):
            if self.text() == self._initial_text:
                self.focusOutEvent(QFocusEvent(QEvent.Type.FocusOut))
            else:
                self.editing_finished.emit(self.text())

        super().keyPressEvent(a0)

    def focusOutEvent(self, a0: QFocusEvent):
        if a0.lostFocus():
            self.lost_focus.emit()
