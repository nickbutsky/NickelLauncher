import os

from PySide6.QtWidgets import QWidget, QToolButton, QLabel, QVBoxLayout, QHBoxLayout
from PySide6.QtCore import QSize, Signal
from PySide6.QtGui import QIcon

from ui import resources


class ExpandableWidget(QWidget):
    expanded = Signal(str)
    collapsed = Signal(str)

    def __init__(self, text: str, parent: QWidget | None = None):
        super().__init__(parent)

        self._is_expanded = False
        self._text = text

        self._expand_button = QToolButton(self)
        self._widget = QWidget(self)

        self._icon_right_arrow = QIcon(os.path.join(':', 'expand_arrows', 'right.png'))
        self._icon_down_arrow = QIcon(os.path.join(':', 'expand_arrows', 'down.png'))

        self.__setup()

    @property
    def text(self) -> str:
        return self._text

    @property
    def is_expanded(self) -> bool:
        return self._is_expanded

    def click(self):
        self._expand_button.setIcon(self._icon_right_arrow if self.is_expanded else self._icon_down_arrow)
        self._widget.setVisible(not self._widget.isVisible())
        self._is_expanded = not self._is_expanded
        if self.is_expanded:
            self.expanded.emit(self.text)
        else:
            self.collapsed.emit(self.text)

    def set_widget(self, widget: QWidget):
        old_widget = self._widget
        self._widget = widget
        self._widget.setParent(self)
        self.layout().replaceWidget(old_widget, self._widget)

        self._widget.setVisible(self.is_expanded)

        old_widget.deleteLater()

    def __setup(self):
        self.setLayout(QVBoxLayout(self))
        self.layout().setContentsMargins(0, 0, 0, 0)

        upper_widget = QWidget(self)
        upper_widget.setLayout(QHBoxLayout(self))
        upper_widget.layout().setContentsMargins(0, 0, 0, 0)
        self.layout().addWidget(upper_widget)

        self._expand_button.setIcon(self._icon_right_arrow)
        self._expand_button.setIconSize(QSize(13, 13))
        upper_widget.layout().addWidget(self._expand_button)

        upper_widget.layout().addWidget(QLabel(self.text, upper_widget))

        self.layout().addWidget(self._widget)
        self._widget.setVisible(False)

        self._expand_button.clicked.connect(self.click)
