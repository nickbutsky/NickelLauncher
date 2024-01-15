from typing import Callable, TypedDict, Any

from ordered_set import OrderedSet

from core.instance import Instance


class InstanceGroup:
    def __init__(self, name: str, instances: list[Instance], hidden: bool = False):
        self.instances = instances
        self.hidden = hidden

        self._name = name.strip()

        self._subscribers: OrderedSet[Callable[[], Any]] = OrderedSet()

    @property
    def name(self) -> str:
        return self._name

    @name.setter
    def name(self, name: str):
        self._name = name.strip()

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
