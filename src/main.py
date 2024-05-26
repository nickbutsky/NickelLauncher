from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent / "backend"))

from itertools import chain
from typing import TYPE_CHECKING

import webview  # pyright: ignore [reportMissingTypeStubs]
from tendo.singleton import SingleInstance

from backend import instancemanager, versionretrieve
from backend.core.version import VersionType

if TYPE_CHECKING:
    from backend.core.instance import Instance
    from backend.core.instancegroup import InstanceGroup
    from backend.core.version import Architecture


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
                            "displayName": instance.version.name,
                            "availableArchitectures": list(instance.version.available_architectures),
                        },
                        "architectureChoice": instance.architecture_choice,
                    }
                    for instance in group.instances
                ],
            }
            for group in instancemanager.get_instance_groups()
        ]

    def getVersionsByType(self) -> dict[VersionType, list[dict[str, str | list[str]]]]:  # noqa: N802
        return {
            version_type: [
                {"displayName": version.name, "availableArchitectures": list(version.available_architectures)}
                for version in versionretrieve.get_versions_locally()
                if version.type == version_type
            ]
            for version_type in VersionType
        }

    def renameGroup(self, old_name: str, new_name: str) -> None:  # noqa: N802
        if old_name == "":
            return

        group = self._get_instance_group(old_name)

        try:
            group_with_new_name = self._get_instance_group(new_name)
        except StopIteration:
            group_with_new_name = None

        if not group_with_new_name:
            group.name = new_name
            return

        instances = group.instances
        group.remove_instances(instances)
        instancemanager.delete_instance_group(group)
        group_with_new_name.add_instances(len(group_with_new_name.instances), instances)

    def toggleGroupHidden(self, name: str) -> None:  # noqa: N802
        self._get_instance_group(name).toggle_hidden()

    def deleteGroup(self, name: str) -> None:  # noqa: N802
        instancemanager.delete_instance_group(self._get_instance_group(name))

    def renameInstance(self, dirname: str, new_name: str) -> None:  # noqa: N802
        instance = self._get_instance(dirname)
        if instance.name == new_name:
            return
        instance.name = new_name

    def changeVersion(self, dirname: str, version_display_name: str) -> None:  # noqa: N802
        instance = self._get_instance(dirname)
        if instance.version.name == version_display_name:
            return
        instance.version = next(
            version for version in versionretrieve.get_versions_locally() if version.name == version_display_name
        )

    def changeArchitectureChoice(self, dirname: str, architecture_choice: Architecture) -> None:  # noqa: N802
        instance = self._get_instance(dirname)
        if instance.architecture_choice == architecture_choice:
            return
        instance.architecture_choice = architecture_choice

    def changeGroup(self, dirname: str, group_name: str) -> None:  # noqa: N802
        instance = self._get_instance(dirname)
        instancemanager.move_instances(sys.maxsize, group_name, [instance])

    def copyInstance(self, dirname: str, copy_worlds: bool) -> None:  # noqa: N802
        instancemanager.copy_instance(self._get_instance(dirname), copy_worlds)

    def launchInstance(self, dirname: str) -> None:  # noqa: N802
        pass

    def createInstance(self, name: str, group_name: str, version_display_name: str) -> None:  # noqa: N802
        instancemanager.create_instance(
            name,
            group_name,
            next(version for version in versionretrieve.get_versions_locally() if version.name == version_display_name),
        )

    def _get_instance_group(self, name: str) -> InstanceGroup:
        return next(group for group in instancemanager.get_instance_groups() if group.name == name)

    def _get_instance(self, dirname: str) -> Instance:
        return next(
            instance
            for instance in chain.from_iterable(group.instances for group in instancemanager.get_instance_groups())
            if instance.directory.name == dirname
        )


def main() -> None:
    me = SingleInstance()  # noqa: F841  # pyright: ignore [reportUnusedVariable]

    webview.create_window("NickelLauncher", "bundled-frontend/index.html", js_api=API())
    webview.start(debug="__compiled__" not in globals())


if __name__ == "__main__":
    main()
