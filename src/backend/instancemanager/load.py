from __future__ import annotations

import string
from dataclasses import dataclass
from typing import TYPE_CHECKING

from pydantic import BaseModel, ValidationError, field_validator, model_validator

from backend.core import Architecture, Instance

from .instancegroup import InstanceGroup

if TYPE_CHECKING:
    from collections.abc import Iterable
    from pathlib import Path
    from typing import Self

    from backend.core import Version


@dataclass(frozen=True, slots=True)
class LoadResult:
    instance_groups: list[InstanceGroup]
    last_instance: Instance | None


def load(directory: Path, versions: Iterable[Version]) -> LoadResult:
    try:
        with (directory / "groups.json").open() as f:
            groups_model = _GroupsModel.model_validate_json(f.read(), strict=True)
    except (OSError, ValidationError):
        return LoadResult(_load_instance_groups([], None, directory, versions), None)

    groups = _load_instance_groups(groups_model.groups, groups_model.last_instance, directory, versions)
    last_instance = _get_last_instance(groups_model.last_instance, groups)
    return LoadResult(groups, last_instance)


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
    def _validate_last_instance_dirname(cls, value: str | None) -> str | None:
        if (value is not None) and (
            any(whitespace_character in value for whitespace_character in string.whitespace) or not value
        ):
            error_msg = "Whitespace and empty strings are not allowed."
            raise ValueError(error_msg)
        return value

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
    def _validate_name(cls, value: str) -> str:
        if value.strip() != value:
            error_msg = "Leading and trailing whitespace is not allowed."
            raise ValueError(error_msg)
        return value

    @field_validator("instances")
    @classmethod
    def _validate_instance_dirnames(cls, value: list[str]) -> list[str]:
        for instance_dirname in value:
            if (
                any(whitespace_character in instance_dirname for whitespace_character in string.whitespace)
                or not instance_dirname
            ):
                error_msg = "Whitespace and empty strings are not allowed."
                raise ValueError(error_msg)
        return value


def _load_instance_groups(
    group_models: list[_GroupModel],
    last_instance_dirname: str | None,
    directory: Path,
    versions: Iterable[Version],
) -> list[InstanceGroup]:
    instances = [
        instance for item in directory.iterdir() if item.is_dir() if (instance := _load_instance(item, versions))
    ]
    if not instances:
        return []

    groups: list[InstanceGroup] = []
    for group_model in group_models:
        instances_of_group = [
            instance
            for instance_dirname in group_model.instances
            if (
                instance := next(
                    (instance for instance in instances if instance.directory.name == instance_dirname),
                    None,
                )
            )
        ]
        if not instances_of_group:
            continue
        for instance in instances_of_group:
            instances.remove(instance)
        groups.append(
            InstanceGroup(
                group_model.name,
                instances_of_group,
                False
                if last_instance_dirname in [instance.directory.name for instance in instances_of_group]
                or group_model.name == ""
                else group_model.hidden,
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
    architecture_choice: Architecture


def _load_instance(directory: Path, versions: Iterable[Version]) -> Instance | None:
    if any(whitespace_character in directory.name for whitespace_character in string.whitespace) or (
        not (directory / "com.mojang").is_dir()
    ):
        return None
    try:
        with (directory / "config.json").open() as f:
            instance_model = _InstanceModel.model_validate_json(f.read(), strict=True)
        version = next(
            v
            for v in versions
            if (v.name == instance_model.version.name)
            and (instance_model.version.architecture_choice in v.available_architectures)
        )
    except (OSError, ValidationError, StopIteration):
        return None
    return Instance(instance_model.name, version, instance_model.version.architecture_choice, directory)


def _get_last_instance(instance_dirname: str | None, instance_groups: list[InstanceGroup]) -> Instance | None:
    if not instance_dirname:
        return None
    for group in instance_groups:
        for instance in group.instances:
            if instance.directory.name == instance_dirname:
                return instance
    return None
