from __future__ import annotations

from itertools import chain
from typing import TYPE_CHECKING

import versionretrieve
from core.instancegroup import InstanceGroup
from env import ROOT

from . import instancecreate as _instancecreate
from . import stateload as _stateload

# from .watchdogthread import WatchdogThread

if TYPE_CHECKING:
    from typing import Sequence

    from core.instance import Instance
    from core.version import Version


def get_instance_groups() -> tuple[InstanceGroup, ...]:
    return _state.instance_groups


def delete_instance_group(instance_group: InstanceGroup) -> None:
    _state.delete_instance_group(instance_group)


def create_instance(name: str, instance_group_name: str, version: Version) -> None:
    # _watchdog.ignore_dir_created_event = True
    _instancecreate.create_instance(name, instance_group_name, version, _state)
    # _watchdog.ignore_dir_created_event = False


def copy_instance(instance: Instance, copy_worlds: bool) -> None:
    # _watchdog.ignore_dir_created_event = True
    _instancecreate.copy_instance(instance, copy_worlds, _state)
    # _watchdog.ignore_dir_created_event = False


def move_instances(position: int, instance_group_name: str, instances: Sequence[Instance]) -> None:
    removal_dict = {
        group.name: [instance for instance in group.instances if instance in instances]
        for group in get_instance_groups()
    }

    for group in get_instance_groups():
        group.remove_instances(removal_dict[group.name])

    try:
        instance_group = next(group for group in _state.instance_groups if group.name == instance_group_name)
    except StopIteration:
        instance_group = InstanceGroup(instance_group_name, [])
        _state.add_instance_group(instance_group)

    instance_group.add_instances(position, tuple(chain.from_iterable(removal_dict.values())))

    for group in get_instance_groups():
        if not group.instances:
            delete_instance_group(instance_group)


_state = _stateload.load_state(ROOT / "instances", versionretrieve.get_versions_locally())
# _watchdog = WatchdogThread(ROOT / "instances")

# _watchdog.start()
