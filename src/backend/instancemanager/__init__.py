from __future__ import annotations

import contextlib
from itertools import chain
from typing import TYPE_CHECKING

from backend import game, versionretrieve
from backend.core import InstanceGroup
from backend.path import ROOT_DIRECTORY

from . import instancecreate as _instancecreate
from . import stateload as _stateload
from .watchdog import Watchdog as _Watchdog

if TYPE_CHECKING:
    from collections.abc import Callable, Sequence
    from pathlib import Path

    from backend.core import Instance, Version


def get_instance_groups() -> tuple[InstanceGroup, ...]:
    return _StateProvider.value.instance_groups


def get_last_instance() -> Instance | None:
    return _StateProvider.value.last_instance


def set_last_instance(instance: Instance) -> None:
    _StateProvider.value.last_instance = instance


def delete_instance_group(group: InstanceGroup) -> None:
    _StateProvider.value.delete_instance_group(group)


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
        _StateProvider.value.add_instance_group(group)

    group.add_instances(position, tuple(chain.from_iterable(removal_list)))
    if group.hidden:
        group.toggle_hidden()

    for group in get_instance_groups():
        if not group.instances:
            delete_instance_group(group)


def create_instance(name: str, group_name: str, version: Version) -> Path:
    with _WatchdogProvider.value.disable_dir_created_event_tracking():
        return _instancecreate.create_instance(name, group_name, version, _StateProvider.value)


def copy_instance(instance: Instance, copy_worlds: bool) -> None:
    with _WatchdogProvider.value.disable_dir_created_event_tracking():
        _instancecreate.copy_instance(instance, copy_worlds, _StateProvider.value)


def initialise_watchdog(on_sudden_change: Callable[[], object]) -> None:
    if isinstance(_WatchdogProvider.value, _Watchdog):
        error_msg = "The watchdog is already initialised."
        raise ValueError(error_msg)  # noqa: TRY004

    def callback() -> None:
        _StateProvider.value = _stateload.load_state(
            ROOT_DIRECTORY / "instances",
            versionretrieve.get_versions_locally(),
        )
        launched_instance = game.get_launched_instance()
        if launched_instance and launched_instance.directory.name not in chain.from_iterable(
            (instance.directory.name for instance in group.instances) for group in _StateProvider.value.instance_groups
        ):
            game.cancel_launch()
        on_sudden_change()

    _WatchdogProvider.value = _Watchdog(ROOT_DIRECTORY / "instances", callback)
    _WatchdogProvider.value.run()


class _WatchdogDummy:
    @staticmethod
    def disable_dir_created_event_tracking() -> contextlib.nullcontext[None]:
        return contextlib.nullcontext()


class _StateProvider:
    value = _stateload.load_state(ROOT_DIRECTORY / "instances", versionretrieve.get_versions_locally())


class _WatchdogProvider:
    value: _Watchdog | _WatchdogDummy = _WatchdogDummy()
