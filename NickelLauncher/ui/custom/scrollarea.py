from PySide6.QtWidgets import QWidget, QScrollArea, QVBoxLayout

from ui.functions import get_widgets, delete_widget


class ScrollArea(QScrollArea):
    def __init__(self, parent: QWidget | None = None):
        super().__init__(parent)
        self.setWidgetResizable(True)

        self._layout = QVBoxLayout(self)

        self.__setup()

    def add_widget(self, widget: QWidget):
        widget.setParent(self)
        self._layout.insertWidget(self._layout.count() - 1, widget)

    def clear(self):
        for widget in get_widgets(self._layout):
            delete_widget(widget)

    def __setup(self):
        self.setFrameShape(QScrollArea.Shape.NoFrame)

        widget = QWidget(self)
        widget.setLayout(self._layout)
        self.setWidget(widget)

        self._layout.setContentsMargins(0, 0, 0, 0)
        self._layout.addStretch()
