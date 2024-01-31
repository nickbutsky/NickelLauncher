from typing import Sequence, Any
from enum import IntEnum, auto

from PySide6.QtCore import QObject, QAbstractListModel, QModelIndex, QPersistentModelIndex, Qt, Property, Slot

import versionretrieve
from core.version import Version, VersionType


class VersionSelectionViewModel(QObject):
    def __init__(self, parent: QObject | None = None):
        super().__init__(parent)
        versions = versionretrieve.get_versions_locally()
        self._sub_view_models = {
            VersionType.RELEASE: _VersionTypeViewModel([v for v in versions if v.type == VersionType.RELEASE]),
            VersionType.BETA: _VersionTypeViewModel([v for v in versions if v.type == VersionType.BETA]),
            VersionType.PREVIEW: _VersionTypeViewModel([v for v in versions if v.type == VersionType.PREVIEW])
        }

    @Property(QObject)
    def releaseViewModel(self) -> QAbstractListModel:
        return self._sub_view_models[VersionType.RELEASE]

    @Property(QObject)
    def betaViewModel(self) -> QAbstractListModel:
        return self._sub_view_models[VersionType.BETA]

    @Property(QObject)
    def previewViewModel(self) -> QAbstractListModel:
        return self._sub_view_models[VersionType.PREVIEW]

    @Slot()
    def refresh(self):
        new_versions = versionretrieve.get_versions_remotely()
        for sub_view_model in self._sub_view_models.values():
            sub_view_model.beginResetModel()
        for version_type, sub_view_model in self._sub_view_models.items():
            sub_view_model.versions = [v for v in new_versions if v.type == version_type]
        for sub_view_model in self._sub_view_models.values():
            sub_view_model.endResetModel()


class _VersionTypeViewModel(QAbstractListModel):
    class Roles(IntEnum):
        NAME_ROLE = Qt.ItemDataRole.UserRole
        ARCHITECTURES_ROLE = auto()

    def __init__(self, versions: Sequence[Version], parent: QObject | None = None):
        super().__init__(parent)
        self.versions = versions

    def rowCount(self, parent: QModelIndex | QPersistentModelIndex = ...) -> int:
        return len(self.versions)

    def data(self, index: QModelIndex | QPersistentModelIndex, role: Qt.ItemDataRole = ...) -> Any:
        if not index.isValid():
            return None
        version = self.versions[index.row()]
        return {
            self.Roles.NAME_ROLE: version.name,
            self.Roles.ARCHITECTURES_ROLE: ' | '.join(version.available_architectures)
        }.get(role, None)

    def roleNames(self) -> dict[Roles, bytes]:
        return {self.Roles.NAME_ROLE: b'name', self.Roles.ARCHITECTURES_ROLE: b'architectures'}
