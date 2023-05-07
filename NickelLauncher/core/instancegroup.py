from dataclasses import dataclass

from core.instance import Instance


@dataclass(slots=True)
class InstanceGroup:
    name: str
    instances: list[Instance]
    hidden: bool = False

    def to_dict(self) -> dict[str, str | bool | list[str]]:
        return {
            'name': self.name,
            'hidden': self.hidden,
            'instances': [instance.dir_name for instance in self.instances]
        }
