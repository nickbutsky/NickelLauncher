from typing import TypedDict

from core.instance import Instance


class InstanceGroup:
    def __init__(self, name: str, instances: list[Instance], hidden: bool = False):
        self.instances = instances
        self.hidden = hidden

        self._name = name.strip()

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
            'instances': [instance.dir_name for instance in self.instances]
        }
