from __future__ import annotations

import os
from itertools import chain
from typing import TYPE_CHECKING, Protocol, runtime_checkable

from . import game, instancemanager, versionretrieve
from .core import Version

if TYPE_CHECKING:
    from .core import Architecture, Instance, InstanceGroup
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
            for group in instancemanager.get_instance_groups()
        ]

    def getLastInstanceDirname(self) -> str | None:  # noqa: N802
        return instance.directory.name if (instance := instancemanager.get_last_instance()) else None

    def getVersionTypeToVersions(self, remotely: bool = False) -> dict[Version.Type, list[dict[str, str | list[str]]]]:  # noqa: N802
        versions = versionretrieve.get_versions_remotely() if remotely else versionretrieve.get_versions_locally()
        return {
            version_type: [
                {"displayName": version.display_name, "availableArchitectures": list(version.available_architectures)}
                for version in versions
                if version.type == version_type
            ]
            for version_type in Version.Type
        }

    def renameInstanceGroup(self, old_name: str, new_name: str) -> None:  # noqa: N802
        if old_name == "":
            return

        group = self._get_instance_group(old_name)

        try:
            group_with_new_name = self._get_instance_group(new_name)
        except StopIteration:
            group.name = new_name
            return
        instancemanager.move_instances(len(group_with_new_name.instances), new_name, group.instances)

    def toggleInstanceGroupHidden(self, name: str) -> None:  # noqa: N802
        self._get_instance_group(name).toggle_hidden()

    def deleteInstanceGroup(self, name: str) -> None:  # noqa: N802
        instancemanager.delete_instance_group(self._get_instance_group(name))

    def moveInstances(self, position: int, group_name: str, dirnames: list[str]) -> None:  # noqa: N802
        instancemanager.move_instances(position, group_name, [self._get_instance(dirname) for dirname in dirnames])

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
            for version in versionretrieve.get_versions_locally()
            if version.display_name == version_display_name
        )

    def changeArchitectureChoice(self, dirname: str, architecture_choice: Architecture) -> None:  # noqa: N802
        instance = self._get_instance(dirname)
        if instance.architecture_choice == architecture_choice:
            return
        instance.architecture_choice = architecture_choice

    def copyInstance(self, dirname: str, copy_worlds: bool) -> None:  # noqa: N802
        instancemanager.copy_instance(self._get_instance(dirname), copy_worlds)

    def createInstance(self, name: str, group_name: str, version_display_name: str) -> str:  # noqa: N802
        return instancemanager.create_instance(
            name,
            group_name,
            next(
                version
                for version in versionretrieve.get_versions_locally()
                if version.display_name == version_display_name
            ),
        ).name

    def openGameDirectory(self, dirname: str) -> None:  # noqa: N802
        os.startfile(self._get_instance(dirname).directory / "com.mojang")  # noqa: S606

    def openInstanceDirectory(self, dirname: str) -> None:  # noqa: N802
        os.startfile(self._get_instance(dirname).directory)  # noqa: S606

    def launchInstance(self, dirname: str) -> None:  # noqa: N802
        instance = self._get_instance(dirname)
        instancemanager.set_last_instance(instance)
        game.launch(instance, lambda report: get_frontend_api().temporary.propel_launch_report(report))

    def cancelInstanceLaunch(self) -> None:  # noqa: N802
        game.cancel_launch()

    def _get_instance_group(self, name: str) -> InstanceGroup:
        return next(group for group in instancemanager.get_instance_groups() if group.name == name)

    def _get_instance(self, dirname: str) -> Instance:
        return next(
            instance
            for instance in chain.from_iterable(group.instances for group in instancemanager.get_instance_groups())
            if instance.directory.name == dirname
        )


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


def get_frontend_api() -> FrontendAPI:
    if not _FrontendAPIProvider.value:
        raise FrontendAPINotSetError
    return _FrontendAPIProvider.value


def set_frontend_api(frontend_api: FrontendAPI) -> None:
    if _FrontendAPIProvider.value:
        raise FrontendAPIAlreadySetError
    _FrontendAPIProvider.value = frontend_api


class FrontendAPINotSetError(ValueError):
    pass


class FrontendAPIAlreadySetError(ValueError):
    pass


class _FrontendAPIProvider:
    value: FrontendAPI | None = None
