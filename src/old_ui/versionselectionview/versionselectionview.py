from typing import Protocol

from PySide6.QtWidgets import QWidget, QTreeWidgetItem, QHeaderView
from PySide6.QtCore import Qt, Signal

from ui.versionselectionview.ui_versionselectionview import Ui_VersionSelectionView


class Version(Protocol):
    @property
    def name(self) -> str: return ...

    @property
    def type(self) -> str: return ...

    @property
    def architecture(self): return ...


class VersionSelectionView(QWidget):
    version_picked = Signal()
    version_list_update_requested = Signal()

    def __init__(self, parent: QWidget | None = None):
        super().__init__(parent)

        self._versions: list[Version] = []

        self._ui = Ui_VersionSelectionView()

        self._setup_ui()
        self._setup_signals()

        self._checkboxes = {
            'release': self._ui.checkbox_release,
            'beta': self._ui.checkbox_beta,
            'preview': self._ui.checkbox_preview
        }

    def get_version_name(self) -> str:
        current_item = self._ui.tree_version_list.currentItem()
        return current_item.text(0) if current_item else ''

    def select_version(self, name: str):
        for checkbox in self._checkboxes.values():
            checkbox.setChecked(False)

        for checkbox in self._checkboxes.values():
            checkbox.setChecked(True)
            tree_items = self._ui.tree_version_list.findItems(name, Qt.MatchFlag.MatchExactly)
            if tree_items:
                self._ui.tree_version_list.setCurrentItem(tree_items[0])
                break
            checkbox.setChecked(False)

    def set_version_list(self, versions: list[Version]):
        self._versions = versions

        self._ui.tree_version_list.clear()

        for item in self._parse_versions(versions):
            root = QTreeWidgetItem(self._ui.tree_version_list)
            for i, sub_item in enumerate(item):
                root.setText(i, sub_item)
            self._ui.tree_version_list.addTopLevelItem(root)
        self._ui.tree_version_list.setCurrentIndex(self._ui.tree_version_list.model().index(0, 0))

    def _reload(self):
        self.set_version_list(self._versions)

    def _get_display_options(self) -> list[str]:
        options = [version_type for version_type in self._checkboxes if self._checkboxes[version_type].isChecked()]
        if not options:
            options = ['release', 'beta', 'preview']
        return options

    def _parse_versions(self, versions: list[Version]) -> list[list[str, str, str, str]]:
        display_options = self._get_display_options()

        display_data_dict = {}
        for version in versions:
            if version.type not in display_options:
                continue

            if version.name not in display_data_dict:
                display_data_dict[version.name] = [version.name, version.type, '', '']
            if version.architecture == 'x64':
                display_data_dict[version.name][2] = '✓'
            elif version.architecture == 'x86':
                display_data_dict[version.name][3] = '✓'

        return [*display_data_dict.values()][::-1]

    def _setup_ui(self):
        self._ui.setupUi(self)

        self._ui.tree_version_list.header().setSectionResizeMode(0, QHeaderView.ResizeMode.Stretch)
        self._ui.tree_version_list.header().setSectionResizeMode(1, QHeaderView.ResizeMode.ResizeToContents)
        self._ui.tree_version_list.header().setSectionResizeMode(2, QHeaderView.ResizeMode.ResizeToContents)
        self._ui.tree_version_list.header().setSectionResizeMode(3, QHeaderView.ResizeMode.ResizeToContents)

    def _setup_signals(self):
        self._ui.checkbox_release.toggled.connect(self._reload)
        self._ui.checkbox_beta.toggled.connect(self._reload)
        self._ui.checkbox_preview.toggled.connect(self._reload)

        self._ui.tree_version_list.itemSelectionChanged.connect(self.version_picked.emit)

        self._ui.button_refresh.clicked.connect(self.version_list_update_requested.emit)
