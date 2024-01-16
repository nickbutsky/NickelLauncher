from __future__ import annotations
from typing import Callable, Self, Any

from ordered_set import OrderedSet

from core.instancegroup import InstanceGroup
from core.instance import Instance


class State:
    def __init__(self, instance_groups: list[InstanceGroup], last_instance: Instance | None):
        self._instance_groups = instance_groups
        self._last_instance = last_instance

        for group in instance_groups:
            group.subscribe_to_change(self._notify_subscribers)

        self._subscribers: OrderedSet[Callable[[Self], Any]] = OrderedSet()

    @property
    def last_instance(self) -> Instance:
        return self._last_instance

    @last_instance.setter
    def last_instance(self, last_instance: Instance):
        self._last_instance = last_instance
        self._notify_subscribers()

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
        self._notify_subscribers()

    def move_instance_group(self, position: int, instance_group: InstanceGroup):
        if instance_group.unnamed:
            return
        self._instance_groups.remove(instance_group)
        self._instance_groups.insert(position, instance_group)
        self._notify_subscribers()

    def delete_instance_group(self, instance_group: InstanceGroup):
        if instance_group.unnamed:
            return
        self._instance_groups.remove(instance_group)
        if not self.instance_groups[0].unnamed:
            self._instance_groups.insert(0, InstanceGroup('', instance_group.instances))
            self._notify_subscribers()
        else:
            unnamed_instance_group = self.instance_groups[0]
            instance_group.move_instances(
                len(unnamed_instance_group.instances), unnamed_instance_group, instance_group.instances
            )

    def to_dict(self) -> dict:
        return {
            'format_version': 1,
            'groups': [group.to_dict() for group in self.instance_groups],
            'last_instance': self.last_instance.directory.name
        }

    def subscribe_to_change(self, subscriber: Callable[[State], Any]):
        self._subscribers.add(subscriber)

    def _notify_subscribers(self):
        for subscriber in self._subscribers:
            subscriber(self)


class InstanceGroupNameTakenError(ValueError):
    pass
