from typing import Any
from pathlib import Path
import json

from core.instancegroup import InstanceGroup
from core.instance import Instance


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
        self._last_instance = last_instance
        self._save()

    @property
    def instance_groups(self) -> tuple[InstanceGroup, ...]:
        return tuple(self._instance_groups)

    def add_instance_group(self, instance_group: InstanceGroup) -> None:
        if instance_group.name in [group.name for group in self.instance_groups]:
            raise InstanceGroupNameTakenError
        if instance_group.unnamed:
            self._instance_groups.insert(0, instance_group)
        else:
            self._instance_groups.append(instance_group)
        instance_group.subscribe_to_change(self._save)
        self._save()

    def move_instance_group(self, position: int, instance_group: InstanceGroup) -> None:
        if instance_group.unnamed:
            return
        self._instance_groups.remove(instance_group)
        self._instance_groups.insert(position, instance_group)
        self._save()

    def delete_instance_group(self, instance_group: InstanceGroup) -> None:
        if instance_group.unnamed:
            return
        self._instance_groups.remove(instance_group)
        if not self.instance_groups[0].unnamed:
            unnamed_instance_group = InstanceGroup("", instance_group.instances)
            self._instance_groups.insert(0, unnamed_instance_group)
            unnamed_instance_group.subscribe_to_change(self._save)
            self._save()
        else:
            unnamed_instance_group = self.instance_groups[0]
            instance_group.move_instances(
                len(unnamed_instance_group.instances), unnamed_instance_group, instance_group.instances
            )

    def _save(self) -> None:
        with (self._directory / "groups.json").open("w") as f:
            json.dump(self._to_dict(), f, indent=4)

    def _to_dict(self) -> dict[str, Any]:
        return {
            "format_version": 1,
            "groups": [group.to_dict() for group in self.instance_groups],
            "last_instance": self.last_instance.directory.name if self.last_instance else None
        }


class InstanceGroupNameTakenError(ValueError):
    pass
