from __future__ import annotations
from typing import Callable, TypedDict, Any

from ordered_set import OrderedSet

from core.instance import Instance


class InstanceGroup:
    def __init__(self, name: str, instances: list[Instance], hidden: bool = False):
        self._name = name.strip()
        self._hidden = hidden
        self._instances = instances

        self._subscribers: OrderedSet[Callable[[], Any]] = OrderedSet()

    @property
    def name(self) -> str:
        return self._name

    @name.setter
    def name(self, name: str):
        self._name = name.strip()
        self._notify_subscribers()

    @property
    def hidden(self) -> bool:
        return self._hidden

    @hidden.setter
    def hidden(self, hidden: bool):
        self._hidden = hidden
        self._notify_subscribers()

    @property
    def instances(self) -> tuple[Instance, ...]:
        return tuple(self._instances)

    def add_instance(self, instance: Instance, position: int):
        pass

    def remove_instance(self, instance: Instance):
        pass

    def move_instance(self, instance: Instance, instance_group: InstanceGroup, position: int):
        pass

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
