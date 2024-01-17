from __future__ import annotations
from typing import Callable, TypedDict, Sequence, Any

from ordered_set import OrderedSet

from instance import Instance


class InstanceGroup:
    def __init__(self, name: str, instances: Sequence[Instance], hidden: bool = False):
        self._name = name.strip()
        self._hidden = hidden if not self.unnamed else False
        self._instances = list(instances)

        self._subscribers: OrderedSet[Callable[[], Any]] = OrderedSet()

    @property
    def unnamed(self) -> bool:
        return self.name == ''

    @property
    def name(self) -> str:
        return self._name

    @name.setter
    def name(self, name: str):
        if self.unnamed:
            return
        self._name = name.strip()
        self._notify_subscribers()

    @property
    def hidden(self) -> bool:
        return self._hidden

    @hidden.setter
    def hidden(self, hidden: bool):
        if self.unnamed:
            return
        self._hidden = hidden
        self._notify_subscribers()

    @property
    def instances(self) -> tuple[Instance, ...]:
        return tuple(self._instances)

    def add_instances(self, position: int, instances: Sequence[Instance]):
        self._instances[position:position] = instances
        self._notify_subscribers()

    def move_instances(self, position: int, instance_group: InstanceGroup, instances: Sequence[Instance]):
        for instance in instances:
            self._instances.remove(instance)
        instance_group._instances[position:position] = instances
        self._notify_subscribers()

    def remove_instance(self, instance: Instance):
        self._instances.remove(instance)
        self._notify_subscribers()

    def to_dict(self) -> TypedDict('', {'name': str, 'hidden': bool, 'instances': list[str]}):
        return {
            'name': self.name,
            'hidden': self.hidden,
            'instances': [instance.directory.name for instance in self.instances]
        }

    def subscribe_to_change(self, subscriber: Callable[[], Any]):
        self._subscribers.add(subscriber)

    def _notify_subscribers(self):
        for subscriber in self._subscribers:
            subscriber()
