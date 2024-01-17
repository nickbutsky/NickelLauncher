from __future__ import annotations
from typing import Callable, Self, Any
from pathlib import Path
import json

from ordered_set import OrderedSet

from core.instancegroup import InstanceGroup
from core.instance import Instance


class State:
    def __init__(self, instance_groups: list[InstanceGroup], last_instance: Instance | None, directory: Path):
        self._instance_groups = instance_groups
        self._last_instance = last_instance
        self._directory = directory

        for group in instance_groups:
            group.subscribe_to_change(self._save)

    @property
    def last_instance(self) -> Instance:
        return self._last_instance

    @last_instance.setter
    def last_instance(self, last_instance: Instance):
        self._last_instance = last_instance
        self._save()

    @property
    def instance_groups(self) -> tuple[InstanceGroup, ...]:
        return tuple(self._instance_groups)

    def add_instance_group(self, instance_group: InstanceGroup):
        if instance_group.name in [group.name for group in self.instance_groups]:
            raise InstanceGroupNameTakenError
        if instance_group.unnamed:
            self._instance_groups.insert(0, instance_group)
        else:
            self._instance_groups.append(instance_group)
        self._save()

    def move_instance_group(self, position: int, instance_group: InstanceGroup):
        if instance_group.unnamed:
            return
        self._instance_groups.remove(instance_group)
        self._instance_groups.insert(position, instance_group)
        self._save()

    def delete_instance_group(self, instance_group: InstanceGroup):
        if instance_group.unnamed:
            return
        self._instance_groups.remove(instance_group)
        if not self.instance_groups[0].unnamed:
            self._instance_groups.insert(0, InstanceGroup('', instance_group.instances))
            self._save()
        else:
            unnamed_instance_group = self.instance_groups[0]
            instance_group.move_instances(
                len(unnamed_instance_group.instances), unnamed_instance_group, instance_group.instances
            )

    def _save(self):
        with open(self._directory / 'groups.json', 'w') as f:
            json.dump(self._to_dict(), f, indent=4)

    def _to_dict(self) -> dict:
        return {
            'format_version': 1,
            'groups': [group.to_dict() for group in self.instance_groups],
            'last_instance': self.last_instance.directory.name
        }


class InstanceGroupNameTakenError(ValueError):
    pass
