from __future__ import annotations

import string
from typing import TYPE_CHECKING

from pydantic import BaseModel, ValidationError, field_validator, model_validator

from backend.core.instance import Instance
from backend.core.instancegroup import InstanceGroup

from .state import State

if TYPE_CHECKING:
    from pathlib import Path
    from typing import Iterable, Self

    from backend.core.version import Version


def load_state(directory: Path, versions: Iterable[Version]) -> State:
    try:
        with (directory / "groups.json").open() as f:
            data = f.read()
        groups_model = _GroupsModel.model_validate_json(data, strict=True)
    except (OSError, ValidationError):
        return State(_load_instance_groups([], None, directory, versions), None, directory)

    groups = _load_instance_groups(groups_model.groups, groups_model.last_instance, directory, versions)
    last_instance = _get_last_instance(groups_model.last_instance, groups)
    return State(groups, last_instance, directory)


class _GroupsModel(BaseModel):
    """Main model.

    The parsed JSON-string must follow the following rules:
    - every instance group name must have no leading or trailing whitespace
    - there must be no instance groups with the same name
    - the unnamed instance group must be at the top
    - every instance dirname must contain no whitespace at all and be at least one character long
    - there must be no instances with the same dirname
    """

    format_version: int
    groups: list[_GroupModel]
    last_instance: str | None

    @field_validator("last_instance")
    @classmethod
    def _validate_last_instance_dirname(cls, last_instance_dirname: str | None) -> str | None:
        if (last_instance_dirname is not None) and (
            any(whitespace_character in last_instance_dirname for whitespace_character in string.whitespace)
            or not last_instance_dirname
        ):
            error_msg = "Whitespace and empty strings are not allowed."
            raise ValueError(error_msg)
        return last_instance_dirname

    @model_validator(mode="after")
    def _finish_validation(self) -> Self:
        group_names: list[str] = []
        instance_dirnames: list[str] = []
        for group_model in self.groups:
            group_names.append(group_model.name)
            instance_dirnames += group_model.instances
        if not (
            (len(group_names) == len(set(group_names))) and (len(instance_dirnames) == len(set(instance_dirnames)))
        ):
            error_msg = "Group names and instance dirnames must be unique."
            raise ValueError(error_msg)

        for i, group_model in enumerate(self.groups):
            if group_model.name == "" and i != 0:
                error_msg = "The unnamed group must be at the top."
                raise ValueError(error_msg)

        return self


class _GroupModel(BaseModel):
    name: str
    hidden: bool
    instances: list[str]

    @field_validator("name")
    @classmethod
    def _validate_name(cls, name: str) -> str:
        if name.strip() != name:
            error_msg = "Leading and trailing whitespace is not allowed."
            raise ValueError(error_msg)
        return name

    @field_validator("instances")
    @classmethod
    def _validate_instance_dirnames(cls, instance_dirnames: list[str]) -> list[str]:
        for instance_dirname in instance_dirnames:
            if (
                any(whitespace_character in instance_dirname for whitespace_character in string.whitespace)
                or not instance_dirname
            ):
                error_msg = "Whitespace and empty strings are not allowed."
                raise ValueError(error_msg)
        return instance_dirnames


def _load_instance_groups(
    group_models: list[_GroupModel],
    last_instance_dirname: str | None,
    directory: Path,
    versions: Iterable[Version],
) -> list[InstanceGroup]:
    instances = [
        instance
        for instance in (_load_instance(item, versions) for item in directory.iterdir() if item.is_dir())
        if instance
    ]
    if not instances:
        return []

    groups: list[InstanceGroup] = []
    for group_model in group_models:
        instances_of_group = [
            instance
            for instance in (
                next((instance for instance in instances if instance.directory.name == instance_dirname), None)
                for instance_dirname in group_model.instances
            )
            if instance
        ]
        if not instances_of_group:
            continue
        for instance in instances_of_group:
            instances.remove(instance)
        groups.append(
            InstanceGroup(
                group_model.name,
                instances_of_group,
                group_model.hidden
                if last_instance_dirname not in [instance.directory.name for instance in instances_of_group]
                and group_model.name != ""
                else False,
            ),
        )
    if not instances:
        return groups

    if groups and groups[0].unnamed:
        groups[0].add_instances(len(groups[0].instances), instances)
    else:
        groups.insert(0, InstanceGroup("", instances))
    return groups


class _InstanceModel(BaseModel):
    format_version: int
    name: str
    version: _VersionModel


class _VersionModel(BaseModel):
    name: str
    architecture_choice: str


def _load_instance(directory: Path, versions: Iterable[Version]) -> Instance | None:
    if any(whitespace_character in directory.name for whitespace_character in string.whitespace) or (
        not (directory / "com.mojang").is_dir()
    ):
        return None

    try:
        with (directory / "config.json").open() as f:
            data = f.read()
        instance_model = _InstanceModel.model_validate_json(data, strict=True)
        version = next(
            v
            for v in versions
            if (v.name == instance_model.version.name)
            and (instance_model.version.architecture_choice in v.available_architectures)
        )
    except (OSError, ValidationError, StopIteration):
        return None

    return Instance(instance_model.name, version, instance_model.version.architecture_choice, directory)  # pyright: ignore [reportArgumentType]


def _get_last_instance(instance_dirname: str | None, instance_groups: list[InstanceGroup]) -> Instance | None:
    if not instance_dirname:
        return None
    for group in instance_groups:
        for instance in group.instances:
            if instance.directory.name == instance_dirname:
                return instance
    return None
