from __future__ import annotations

import contextlib
import json
import shutil
from itertools import chain
from typing import TYPE_CHECKING

from backend import shell, utility
from backend.core import Instance
from backend.game import Game
from backend.path import ROOT_DIRECTORY
from backend.versionretriever import VersionRetriever

from . import load as _load
from .instancegroup import InstanceGroup
from .watchdog import Watchdog as _Watchdog

if TYPE_CHECKING:
    from collections.abc import Callable, Iterable
    from pathlib import Path

    from backend.core import Version


class _WatchdogDummy:
    @staticmethod
    def disable_dir_created_event_tracking() -> contextlib.nullcontext[None]:
        return contextlib.nullcontext()


@utility.typed_namespace
class InstanceManager:
    DIRECTORY = ROOT_DIRECTORY / "instances"

    _watchdog: _Watchdog | _WatchdogDummy = _WatchdogDummy()

    def __init__(self) -> None:
        load_result = _load.load(self.DIRECTORY, VersionRetriever.get_versions_locally())
        self._instance_groups = load_result.instance_groups
        for group in self._instance_groups:
            group.subscribe_to_change(self._save)
        self._last_instance = load_result.last_instance

    @property
    def instance_groups(self) -> tuple[InstanceGroup, ...]:
        return tuple(self._instance_groups)

    @property
    def last_instance(self) -> Instance | None:
        return self._last_instance

    @last_instance.setter
    def last_instance(self, value: Instance) -> None:
        self._last_instance = value
        self._save()

    def move_instance_group(self, position: int, group: InstanceGroup) -> None:
        self._instance_groups.remove(group)
        self._instance_groups.insert(position, group)
        self._save()

    def move_instances(self, position: int, group_name: str, instances: Iterable[Instance]) -> None:
        for group in self.instance_groups:
            instances_to_remove = [instance for instance in group.instances if instance in instances]
            if instances_to_remove:
                group.remove_instances(instances_to_remove)

        try:
            group = next(group for group in self.instance_groups if group.name == group_name)
        except StopIteration:
            group = InstanceGroup(group_name, [])
            if group.unnamed:
                self._instance_groups.insert(0, group)
            else:
                self._instance_groups.append(group)
            group.subscribe_to_change(self._save)

        group.add_instances(position, instances)
        if group.hidden:
            group.toggle_hidden()

        for group in self.instance_groups:
            if not group.instances:
                self._instance_groups.remove(group)

        self._save()

    def copy_instance(self, instance: Instance, copy_worlds: bool) -> None:
        with self._watchdog.disable_dir_created_event_tracking():
            copied_instance = Instance(
                f"{instance.name}(copy)",
                instance.version,
                instance.architecture_choice,
                shell.create_subdirectory(instance.name, self.DIRECTORY),
            )
            copied_instance.populate_directory()
            shutil.copytree(
                instance.directory / "com.mojang",
                copied_instance.directory / "com.mojang",
                ignore=lambda src, _: ["minecraftWorlds"]
                if not copy_worlds and (src == str(instance.directory / "com.mojang"))
                else [],
                dirs_exist_ok=True,
            )
            (copied_instance.directory / "com.mojang" / "minecraftWorlds").mkdir(exist_ok=True)
            group = next(group for group in self.instance_groups if instance in group.instances)
            group.add_instances(group.instances.index(instance) + 1, [copied_instance])
        self._save()

    def create_instance(self, name: str, group_name: str, version: Version) -> Path:
        with self._watchdog.disable_dir_created_event_tracking():
            instance_directory = shell.create_subdirectory(name, self.DIRECTORY)
            instance = Instance(name, version, version.available_architectures[0], instance_directory)
            instance.populate_directory()

            try:
                group = next(group for group in self.instance_groups if group.name == group_name)
            except StopIteration:
                group = InstanceGroup(group_name, [])
                if group.unnamed:
                    self._instance_groups.insert(0, group)
                else:
                    self._instance_groups.append(group)
                group.subscribe_to_change(self._save)

            group.add_instances(len(group.instances), [instance])
            if group.hidden:
                group.toggle_hidden()

            self._save()
            return instance_directory

    def initialise_watchdog(self, on_sudden_change: Callable[[], object]) -> None:
        if isinstance(self._watchdog, _Watchdog):
            error_msg = "The watchdog is already initialised."
            raise ValueError(error_msg)  # noqa: TRY004

        def callback() -> None:
            load_result = _load.load(self.DIRECTORY, VersionRetriever.get_versions_locally())
            self._instance_groups = load_result.instance_groups
            for group in self._instance_groups:
                group.subscribe_to_change(self._save)
            self._last_instance = load_result.last_instance
            if Game.launched_instance and Game.launched_instance.directory.name not in chain.from_iterable(
                (instance.directory.name for instance in group.instances) for group in self.instance_groups
            ):
                Game.cancel_launch()
            on_sudden_change()

        self._watchdog = _Watchdog(self.DIRECTORY, callback)
        self._watchdog.run()

    def _save(self) -> None:
        with (self.DIRECTORY / "groups.json").open("w") as f:
            json.dump(
                {
                    "format_version": 1,
                    "groups": [
                        {
                            "name": group.name,
                            "hidden": group.hidden,
                            "instances": [instance.directory.name for instance in group.instances],
                        }
                        for group in self.instance_groups
                    ],
                    "last_instance": self.last_instance.directory.name if self.last_instance else None,
                },
                f,
                indent=2,
            )
