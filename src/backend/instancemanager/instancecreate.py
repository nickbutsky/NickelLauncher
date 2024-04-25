from __future__ import annotations
import shutil

import shell
from core.instance import Instance
from core.version import Version
from core.instancegroup import InstanceGroup
from .state import State


def create_instance(name: str, instance_group_name: str, version: Version, state: State) -> None:
    instance = Instance(
        name, version, version.available_architectures[0], shell.create_subdirectory(name, state.directory)
    )
    instance.populate_directory()

    instance_group = next((group for group in state.instance_groups if group.name == instance_group_name), None)
    if instance_group:
        instance_group.add_instances(len(instance_group.instances), [instance])
    else:
        state.add_instance_group(InstanceGroup(instance_group_name, [instance]))

    state.last_instance = instance


def copy_instance(instance: Instance, copy_worlds: bool, state: State) -> None:
    copied_instance = Instance(
        f"{instance.name}(copy)",
        instance.version,
        instance.architecture_choice,
        shell.create_subdirectory(instance.name, state.directory)
    )
    copied_instance.populate_directory()
    shutil.copytree(
        instance.directory / "com.mojang",
        copied_instance.directory / "com.mojang",
        ignore=lambda src, _: ["minecraftWorlds"] if (src == str(instance.directory)) and (not copy_worlds) else []
    )
    (copied_instance.directory / "com.mojang" / "minecraftWorlds").mkdir(exist_ok=True)

    instance_group = next(group for group in state.instance_groups if instance in group.instances)
    instance_group.add_instances(instance_group.instances.index(instance) + 1, [copied_instance])
    state.last_instance = copied_instance
