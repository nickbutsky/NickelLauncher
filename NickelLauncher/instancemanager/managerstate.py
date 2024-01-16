from typing import Callable, Any

from ordered_set import OrderedSet

from core.instancegroup import InstanceGroup
from core.instance import Instance


class ManagerState:
    def __init__(self, instance_groups: list[InstanceGroup], last_instance: Instance | None):
        self._instance_groups = instance_groups
        self._last_instance = last_instance

        self._subscribers: OrderedSet[Callable[[], Any]] = OrderedSet()

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
        pass

    def move_instance_group(self, position: int, instance_group: InstanceGroup):
        pass

    def delete_instance_group(self, instance_group: InstanceGroup):
        pass

    def subscribe_to_change(self, subscriber: Callable[[], Any]):
        self._subscribers.add(subscriber)

    def _notify_subscribers(self):
        for subscriber in self._subscribers:
            subscriber()
