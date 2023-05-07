from PySide6.QtWidgets import QApplication, QWidget, QScrollArea, QLayout
from PySide6.QtCore import QTimer


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
