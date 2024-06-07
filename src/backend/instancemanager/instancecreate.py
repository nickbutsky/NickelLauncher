from __future__ import annotations

import shutil
from typing import TYPE_CHECKING

import shell
from core.instance import Instance
from core.instancegroup import InstanceGroup

if TYPE_CHECKING:
    from core.version import Version

    from .state import State


def create_instance(name: str, group_name: str, version: Version, state: State) -> None:
    instance = Instance(
        name,
        version,
        version.available_architectures[0],
        shell.create_subdirectory(name, state.directory),
    )
    instance.populate_directory()

    group = next((group for group in state.instance_groups if group.name == group_name), None)
    if group:
        group.add_instances(len(group.instances), [instance])
        if group.hidden:
            group.toggle_hidden()
    else:
        state.add_instance_group(InstanceGroup(group_name, [instance]))


def copy_instance(instance: Instance, copy_worlds: bool, state: State) -> None:
    copied_instance = Instance(
        f"{instance.name}(copy)",
        instance.version,
        instance.architecture_choice,
        shell.create_subdirectory(instance.name, state.directory),
    )
    copied_instance.populate_directory()
    shutil.copytree(
        instance.directory / "com.mojang",
        copied_instance.directory / "com.mojang",
        ignore=lambda src, _: ["minecraftWorlds"] if (src == str(instance.directory)) and (not copy_worlds) else [],
        dirs_exist_ok=True,
    )
    (copied_instance.directory / "com.mojang" / "minecraftWorlds").mkdir(exist_ok=True)

    group = next(group for group in state.instance_groups if instance in group.instances)
    group.add_instances(group.instances.index(instance) + 1, [copied_instance])
    state.last_instance = copied_instance
