from typing import Any, Callable

from PySide6.QtWidgets import QApplication, QWidget, QScrollArea, QMessageBox, QLineEdit, QAbstractButton, QLayout
from PySide6.QtCore import Qt, QTimer, QRegularExpression
from PySide6.QtGui import QRegularExpressionValidator


def show_message_box(icon: QMessageBox.Icon, title: str, text: str, parent: QWidget | None = None):
    message_box = QMessageBox(icon, title, text, parent=parent)
    message_box.setAttribute(Qt.WidgetAttribute.WA_DeleteOnClose)
    message_box.show()


def show_question_box(
        title: str,
        text: str,
        on_yes: Callable[[], Any] | None,
        on_no: Callable[[], Any] | None = None,
        show_cancel: bool = False,
        parent: QWidget | None = None
):
    standard_buttons = QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
    if show_cancel:
        standard_buttons |= QMessageBox.StandardButton.Cancel

    question_box = QMessageBox(QMessageBox.Icon.Question, title, text, standard_buttons, parent)
    question_box.setAttribute(Qt.WidgetAttribute.WA_DeleteOnClose)

    def on_button_clicked(button: QAbstractButton):
        slot = {
            QMessageBox.ButtonRole.YesRole: on_yes,
            QMessageBox.ButtonRole.NoRole: on_no,
            QMessageBox.ButtonRole.RejectRole: None
        }[question_box.buttonRole(button)]
        if slot:
            slot()

    question_box.buttonClicked.connect(on_button_clicked)

    question_box.show()


def ensure_widget_visible(scroll_area: QScrollArea, widget: QWidget):
    # This is probably bad, but it's the smoothest solution yet
    if scroll_area.isVisible():
        for _ in range(500):
            QApplication.processEvents()
            scroll_area.ensureWidgetVisible(widget)
    else:
        def func(): scroll_area.ensureWidgetVisible(widget)
        QTimer.singleShot(0, func)


def get_widgets(layout: QLayout) -> list[QWidget]:
    widgets = []
    for i in range(layout.count()):
        widget = layout.itemAt(i).widget()
        if isinstance(widget, QWidget):
            widgets.append(widget)
    return widgets


def delete_widget(widget: QWidget):
    layout = find_parent_layout(widget)
    if layout:
        layout.removeWidget(widget)
    widget.setParent(None)
    widget.deleteLater()


def find_parent_layout(widget: QWidget) -> QLayout | None:
    parent_widget = widget.parentWidget()
    if parent_widget and parent_widget.layout():
        return _find_parent_layout(widget, parent_widget.layout())
    return None


def set_no_leading_whitespace_validator(line_edit: QLineEdit):
    line_edit.setValidator(QRegularExpressionValidator(QRegularExpression(r'^[^ \t].*$'), line_edit))


def _find_parent_layout(widget: QWidget, top_level_layout: QLayout) -> QLayout | None:
    for obj in top_level_layout.children():
        if isinstance(obj, QLayout):
            layout = obj
            if layout.indexOf(widget) > -1:
                return layout
            elif layout.children():
                layout = _find_parent_layout(widget, layout)
                if layout:
                    return layout
    return None
