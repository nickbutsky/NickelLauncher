from typing import Callable, Any

from ordered_set import OrderedSet

from core.instancegroup import InstanceGroup
from core.instance import Instance


class ManagerState:
    def __init__(
            self,
            unnamed_instance_group: InstanceGroup | None,
            named_instance_groups: list[InstanceGroup],
            last_instance: Instance | None
    ):
        self._unnamed_instance_group = unnamed_instance_group
        self._named_instance_groups = named_instance_groups
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
    def unnamed_instance_group(self) -> InstanceGroup | None:
        return self._unnamed_instance_group

    @property
    def named_instance_groups(self) -> tuple[InstanceGroup, ...]:
        return tuple(self._named_instance_groups)

    def add_instance_group(self, instance_group: InstanceGroup):
        if ((instance_group.unnamed and self.unnamed_instance_group is not None)
                or instance_group.name in [group.name for group in self.named_instance_groups]):
            raise InstanceGroupNameTakenError

        if instance_group.unnamed:
            self._unnamed_instance_group = instance_group
        else:
            self._named_instance_groups.append(instance_group)
        self._notify_subscribers()

    def move_instance_group(self, position: int, instance_group: InstanceGroup):
        if instance_group == self.unnamed_instance_group:
            return
        self._named_instance_groups.remove(instance_group)
        self._named_instance_groups.insert(position, instance_group)
        self._notify_subscribers()

    def delete_instance_group(self, instance_group: InstanceGroup):
        if instance_group == self.unnamed_instance_group:
            return
        self._named_instance_groups.remove(instance_group)
        self._notify_subscribers()

    def subscribe_to_change(self, subscriber: Callable[[], Any]):
        self._subscribers.add(subscriber)

    def _notify_subscribers(self):
        for subscriber in self._subscribers:
            subscriber()


class InstanceGroupNameTakenError(ValueError):
    pass
