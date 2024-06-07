from __future__ import annotations

import contextlib
from itertools import chain
from typing import TYPE_CHECKING

import versionretrieve
from core.instancegroup import InstanceGroup
from env import ROOT

from . import instancecreate as _instancecreate
from . import stateload as _stateload
from .watchdog import Watchdog as _Watchdog

if TYPE_CHECKING:
    from typing import Callable, Sequence

    from core.instance import Instance
    from core.version import Version


def get_instance_groups() -> tuple[InstanceGroup, ...]:
    return _state.instance_groups


def get_last_instance() -> Instance | None:
    return _state.last_instance


def set_last_instance(instance: Instance) -> None:
    _state.last_instance = instance


def delete_instance_group(group: InstanceGroup) -> None:
    _state.delete_instance_group(group)


def move_instances(position: int, group_name: str, instances: Sequence[Instance]) -> None:
    removal_list = [
        [instance for instance in group.instances if instance in instances] for group in get_instance_groups()
    ]

    for i, group in enumerate(get_instance_groups()):
        if removal_list[i]:
            group.remove_instances(removal_list[i])

    try:
        group = next(group for group in get_instance_groups() if group.name == group_name)
    except StopIteration:
        group = InstanceGroup(group_name, [])
        _state.add_instance_group(group)

    group.add_instances(position, tuple(chain.from_iterable(removal_list)))
    if group.hidden:
        group.toggle_hidden()

    for group in get_instance_groups():
        if not group.instances:
            delete_instance_group(group)


def create_instance(name: str, group_name: str, version: Version) -> None:
    with _watchdog.disable_dir_created_event_tracking():
        _instancecreate.create_instance(name, group_name, version, _state)


def copy_instance(instance: Instance, copy_worlds: bool) -> None:
    with _watchdog.disable_dir_created_event_tracking():
        _instancecreate.copy_instance(instance, copy_worlds, _state)


def initialise_watchdog(on_sudden_change: Callable[[], object]) -> None:
    global _watchdog  # noqa: PLW0603
    if isinstance(_watchdog, _Watchdog):
        error_msg = "The watchdog is already initialised."
        raise ValueError(error_msg)  # noqa: TRY004

    def callback() -> None:
        global _state  # noqa: PLW0603
        _state = _stateload.load_state(ROOT / "instances", versionretrieve.get_versions_locally())
        on_sudden_change()

    _watchdog = _Watchdog(ROOT / "instances", callback)
    _watchdog.run()


class _WatchdogDummy:
    @staticmethod
    def disable_dir_created_event_tracking() -> contextlib.nullcontext[None]:
        return contextlib.nullcontext()


_state = _stateload.load_state(ROOT / "instances", versionretrieve.get_versions_locally())
_watchdog = _WatchdogDummy()
