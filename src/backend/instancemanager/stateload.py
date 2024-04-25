from __future__ import annotations
from typing import TYPE_CHECKING

from pydantic import BaseModel, ValidationError, field_validator, model_validator

from core.instance import Instance
from core.instancegroup import InstanceGroup
from .state import State

if TYPE_CHECKING:
    from core.version import Version
    from typing import Iterable, Self
    from pathlib import Path


def load_state(directory: Path, versions: Iterable[Version]) -> State:
    try:
        with (directory / "groups.json").open() as f:
            data = f.read()
        groups_model = _GroupsModel.model_validate_json(data, strict=True)
    except (OSError, ValidationError):
        return State(_load_instance_groups([], directory, versions), None, directory)

    groups_model.adapt_to_directory(directory)

    instance_groups = _load_instance_groups(groups_model.groups, directory, versions)
    last_instance = _get_last_instance(groups_model.last_instance, instance_groups)
    return State(instance_groups, last_instance, directory)


class _GroupsModel(BaseModel):
    format_version: int
    groups: list[_GroupModel]
    last_instance: str | None

    def adapt_to_directory(self, directory: Path) -> None:
        existing_dirnames = [item.name for item in directory.iterdir() if item.is_dir()]
        mentioned_existing_dirnames: list[str] = []
        for group_model in self.groups:
            group_model.instances[:] = [
                instance_dirname for instance_dirname in group_model.instances if instance_dirname in existing_dirnames
            ]
            mentioned_existing_dirnames += group_model.instances

        self.groups[:] = [group_model for group_model in self.groups if group_model.instances]

        not_mentioned_existing_dirnames = [
            dirname for dirname in existing_dirnames if dirname not in mentioned_existing_dirnames
        ]

        if not not_mentioned_existing_dirnames:
            return

        if not self.groups or self.groups[0].name != "":
            self.groups.insert(0, _GroupModel(name="", hidden=False, instances=[]))
        self.groups[0].instances += not_mentioned_existing_dirnames

    @field_validator("last_instance")
    @classmethod
    def _validate_last_instance_dirname(cls, last_instance_dirname: str | None) -> str | None:
        if (last_instance_dirname is not None) and (len(last_instance_dirname.split()) != 1):
            error_msg = "Whitespace or empty strings is not allowed"
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
            error_msg = "Group names and instance dirnames must be unique"
            raise ValueError(error_msg)

        for i, group_model in enumerate(self.groups):
            if group_model.name == "" and i != 0:
                error_msg = "The unnamed group must be at the top"
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
            error_msg = "Leading and trailing whitespace is not allowed"
            raise ValueError(error_msg)
        return name

    @field_validator("instances")
    @classmethod
    def _validate_instance_dirnames(cls, instance_dirnames: list[str]) -> list[str]:
        for instance_dirname in instance_dirnames:
            if len(instance_dirname.split()) != 1:
                error_msg = "Whitespace is not allowed"
                raise ValueError(error_msg)
        return instance_dirnames


def _load_instance_groups(
        group_models: list[_GroupModel], directory: Path, versions: Iterable[Version]
) -> list[InstanceGroup]:
    groups: list[InstanceGroup] = []
    for group_model in group_models:
        instances = [
            instance for instance in [
                _load_instance(directory / dirname, versions) for dirname in group_model.instances
            ] if instance is not None
        ]
        if not instances:
            break
        groups.append(InstanceGroup(group_model.name, instances, group_model.hidden))

    return groups


class _InstanceModel(BaseModel):
    format_version: int
    name: str
    version: _VersionModel


class _VersionModel(BaseModel):
    name: str
    architecture_choice: str


def _load_instance(directory: Path, versions: Iterable[Version]) -> Instance | None:
    if (len(directory.name.split()) != 1) or (not (directory / "com.mojang").is_dir()):
        return None

    try:
        with (directory / "config.json").open() as f:
            data = f.read()
        instance_model = _InstanceModel.model_validate_json(data, strict=True)
        version = next(
            v for v in versions if (v.name == instance_model.version.name)
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
