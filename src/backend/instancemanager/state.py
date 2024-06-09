from __future__ import annotations

import json
from typing import TYPE_CHECKING

from backend.core.instancegroup import InstanceGroup, InvalidUnnamedInstanceGroupManipulationError

if TYPE_CHECKING:
    from pathlib import Path

    from backend.core.instance import Instance


class State:
    def __init__(self, instance_groups: list[InstanceGroup], last_instance: Instance | None, directory: Path) -> None:
        self._instance_groups = instance_groups
        self._last_instance = last_instance
        self._directory = directory

        for group in instance_groups:
            group.subscribe_to_change(self._save)

    @property
    def directory(self) -> Path:
        return self._directory

    @property
    def last_instance(self) -> Instance | None:
        return self._last_instance

    @last_instance.setter
    def last_instance(self, last_instance: Instance) -> None:
        if last_instance == self.last_instance:
            return
        self._last_instance = last_instance
        self._save()

    @property
    def instance_groups(self) -> tuple[InstanceGroup, ...]:
        return tuple(self._instance_groups)

    def add_instance_group(self, group: InstanceGroup) -> None:
        if group.name in [group.name for group in self.instance_groups]:
            error_msg = f'An instance group with the name "{group.name}" already exists.'
            raise ValueError(error_msg)
        if group.unnamed:
            self._instance_groups.insert(0, group)
        else:
            self._instance_groups.append(group)
        group.subscribe_to_change(self._save)
        self._save()

    def move_instance_group(self, position: int, group: InstanceGroup) -> None:
        if group.unnamed:
            raise InvalidUnnamedInstanceGroupManipulationError
        self._instance_groups.remove(group)
        self._instance_groups.insert(position, group)
        self._save()

    def delete_instance_group(self, group: InstanceGroup) -> None:
        if not group.instances:
            self._instance_groups.remove(group)
            self._save()
            return

        if group.unnamed:
            raise InvalidUnnamedInstanceGroupManipulationError

        self._instance_groups.remove(group)

        if self.instance_groups and self.instance_groups[0].unnamed:
            unnamed_group = self.instance_groups[0]
            instances = group.instances
            group.remove_instances(instances)
            unnamed_group.add_instances(len(unnamed_group.instances), instances)
        else:
            unnamed_group = InstanceGroup("", group.instances)
            self._instance_groups.insert(0, unnamed_group)
            unnamed_group.subscribe_to_change(self._save)
        self._save()

    def _save(self) -> None:
        with (self._directory / "groups.json").open("w") as f:
            json.dump(self._to_dict(), f, indent=2)

    def _to_dict(self) -> dict[str, object]:
        return {
            "format_version": 1,
            "groups": [group.to_dict() for group in self.instance_groups],
            "last_instance": self.last_instance.directory.name if self.last_instance else None,
        }
