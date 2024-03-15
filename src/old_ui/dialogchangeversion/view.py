from typing import Self

from PySide6.QtWidgets import QWidget, QDialog, QDialogButtonBox, QVBoxLayout
from PySide6.QtCore import Qt, Signal

from ui.versionselectionview.versionselectionview import VersionSelectionView, Version


class DialogChangeVersion(QDialog):
    ok = Signal()
    version_list_update_requested = Signal()

    def __init__(self, parent: QWidget | None = None):
        super().__init__(parent)
        self.setAttribute(Qt.WidgetAttribute.WA_DeleteOnClose)

        self._version_view = VersionSelectionView(self)
        self._button_box = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel, self
        )

        self._setup_ui()
        self._setup_signals()

    @property
    def widget(self) -> Self:
        return self

    def spawn_async(self):
        self.setModal(True)
        self.show()

    def get_version_name(self) -> str:
        return self._version_view.get_version_name()

    def select_version(self, name: str):
        self._version_view.select_version(name)

    def set_version_list(self, versions: list[Version]):
        self._version_view.set_version_list(versions)

    def _setup_ui(self):
        self.setWindowTitle('Change Minecraft version')

        self.setLayout(QVBoxLayout(self))

        self.layout().addWidget(self._version_view)
        self.layout().addWidget(self._button_box)

    def _setup_signals(self):
        self._version_view.version_list_update_requested.connect(self.version_list_update_requested.emit)

        self._button_box.accepted.connect(self.ok.emit)
        self._button_box.rejected.connect(self.reject)
