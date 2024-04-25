from __future__ import annotations

from typing import TYPE_CHECKING

from ordered_set import OrderedSet

if TYPE_CHECKING:
    from typing import Callable, Sequence

    from core.instance import Instance


class InstanceGroup:
    def __init__(self, name: str, instances: Sequence[Instance], hidden: bool = False) -> None:
        self._name = name.strip()
        self._hidden = hidden if not self.unnamed else False
        self._instances = list(instances)

        self._subscribers: OrderedSet[Callable[[], object]] = OrderedSet({})

    @property
    def unnamed(self) -> bool:
        return self.name == ""

    @property
    def name(self) -> str:
        return self._name

    @name.setter
    def name(self, name: str) -> None:
        if self.unnamed:
            return
        self._name = name.strip()
        self._notify_subscribers()

    @property
    def hidden(self) -> bool:
        return self._hidden

    @hidden.setter
    def hidden(self, hidden: bool) -> None:
        if self.unnamed:
            return
        self._hidden = hidden
        self._notify_subscribers()

    @property
    def instances(self) -> tuple[Instance, ...]:
        return tuple(self._instances)

    def add_instances(self, position: int, instances: Sequence[Instance]) -> None:
        self._instances[position:position] = instances
        self._notify_subscribers()

    def move_instances(self, position: int, instance_group: InstanceGroup, instances: Sequence[Instance]) -> None:
        for instance in instances:
            self._instances.remove(instance)
        instance_group._instances[position:position] = instances  # noqa: SLF001
        self._notify_subscribers()

    def remove_instance(self, instance: Instance) -> None:
        self._instances.remove(instance)
        self._notify_subscribers()

    def to_dict(self) -> dict[str, object]:
        return {
            "name": self.name,
            "hidden": self.hidden,
            "instances": [instance.directory.name for instance in self.instances]
        }

    def subscribe_to_change(self, subscriber: Callable[[], object]) -> None:
        self._subscribers.add(subscriber)

    def _notify_subscribers(self) -> None:
        for subscriber in self._subscribers:
            subscriber()
