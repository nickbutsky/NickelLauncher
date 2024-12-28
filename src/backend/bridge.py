from __future__ import annotations

import os
from itertools import chain
from typing import TYPE_CHECKING, Protocol, runtime_checkable

from . import utility
from .core import Version
from .game import Game
from .instancemanager import InstanceManager
from .versionretriever import VersionRetriever

if TYPE_CHECKING:
    from .core import Architecture, Instance
    from .report import Report


class API:
    def getInstanceGroups(self) -> list[dict[str, object]]:  # noqa: N802
        return [
            {
                "name": group.name,
                "hidden": group.hidden,
                "instances": [
                    {
                        "name": instance.name,
                        "dirname": instance.directory.name,
                        "version": {
                            "displayName": instance.version.display_name,
                            "availableArchitectures": list(instance.version.available_architectures),
                        },
                        "architectureChoice": instance.architecture_choice,
                    }
                    for instance in group.instances
                ],
            }
            for group in InstanceManager.instance_groups
        ]

    def getLastInstanceDirname(self) -> str | None:  # noqa: N802
        return instance.directory.name if (instance := InstanceManager.last_instance) else None

    def getVersionTypeToVersions(self, remotely: bool = False) -> dict[Version.Type, list[dict[str, str | list[str]]]]:  # noqa: N802
        versions = VersionRetriever.get_versions_remotely() if remotely else VersionRetriever.get_versions_locally()
        return {
            version_type: [
                {"displayName": version.display_name, "availableArchitectures": list(version.available_architectures)}
                for version in versions
                if version.type == version_type
            ]
            for version_type in Version.Type
        }

    def toggleInstanceGroupHidden(self, name: str) -> None:  # noqa: N802
        next(group for group in InstanceManager.instance_groups if group.name == name).toggle_hidden()

    def moveInstanceGroup(self, position: int, group_name: str) -> None:  # noqa: N802
        InstanceManager.move_instance_group(
            position,
            next(group for group in InstanceManager.instance_groups if group.name == group_name),
        )

    def moveInstances(self, position: int, group_name: str, dirnames: list[str]) -> None:  # noqa: N802
        InstanceManager.move_instances(position, group_name, [self._get_instance(dirname) for dirname in dirnames])

    def renameInstance(self, dirname: str, new_name: str) -> None:  # noqa: N802
        instance = self._get_instance(dirname)
        if instance.name == new_name:
            return
        instance.name = new_name

    def changeVersion(self, dirname: str, version_display_name: str) -> None:  # noqa: N802
        instance = self._get_instance(dirname)
        if instance.version.display_name == version_display_name:
            return
        instance.version = next(
            version
            for version in VersionRetriever.get_versions_locally()
            if version.display_name == version_display_name
        )

    def changeArchitectureChoice(self, dirname: str, architecture_choice: Architecture) -> None:  # noqa: N802
        instance = self._get_instance(dirname)
        if instance.architecture_choice == architecture_choice:
            return
        instance.architecture_choice = architecture_choice

    def copyInstance(self, dirname: str, copy_worlds: bool) -> None:  # noqa: N802
        InstanceManager.copy_instance(self._get_instance(dirname), copy_worlds)

    def createInstance(self, name: str, group_name: str, version_display_name: str) -> str:  # noqa: N802
        return InstanceManager.create_instance(
            name,
            group_name,
            next(
                version
                for version in VersionRetriever.get_versions_locally()
                if version.display_name == version_display_name
            ),
        ).name

    def openGameDirectory(self, dirname: str) -> None:  # noqa: N802
        os.startfile(self._get_instance(dirname).directory / "com.mojang")  # noqa: S606

    def openInstanceDirectory(self, dirname: str) -> None:  # noqa: N802
        os.startfile(self._get_instance(dirname).directory)  # noqa: S606

    def launchInstance(self, dirname: str) -> None:  # noqa: N802
        instance = self._get_instance(dirname)
        InstanceManager.last_instance = instance
        Game.run(instance, lambda report: Bridge.frontend_api.temporary.propel_launch_report(report))

    def cancelInstanceLaunch(self) -> None:  # noqa: N802
        Game.cancel_launch()

    @staticmethod
    def _get_instance(dirname: str) -> Instance:
        return next(
            instance
            for instance in chain.from_iterable(group.instances for group in InstanceManager.instance_groups)
            if instance.directory.name == dirname
        )


@utility.typed_namespace
class Bridge:
    _api = API()
    _frontend_api: FrontendAPI | None = None

    @property
    def api(self) -> API:
        return self._api

    @property
    def frontend_api(self) -> FrontendAPI:
        if not self._frontend_api:
            raise FrontendAPINotSetError
        return self._frontend_api

    @frontend_api.setter
    def frontend_api(self, value: FrontendAPI) -> None:
        if self._frontend_api:
            raise FrontendAPIAlreadySetError
        self._frontend_api = value


@runtime_checkable
class FrontendAPI(Protocol):
    @property
    def static(self) -> FrontendAPIStatic: ...
    @property
    def temporary(self) -> FrontendAPITemporary: ...


class FrontendAPIStatic(Protocol):
    def on_sudden_change(self) -> None: ...


class FrontendAPITemporary(Protocol):
    def propel_launch_report(self, report: Report) -> None: ...


class FrontendAPINotSetError(ValueError):
    pass


class FrontendAPIAlreadySetError(ValueError):
    pass
