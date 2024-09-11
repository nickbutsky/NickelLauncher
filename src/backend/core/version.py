from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum, auto
from typing import TYPE_CHECKING

from ordered_set import OrderedSet

from backend import packagemanager

if TYPE_CHECKING:
    from collections.abc import Mapping, Sequence
    from pathlib import Path


class VersionType(StrEnum):
    RELEASE = auto()
    BETA = auto()
    PREVIEW = auto()


class Architecture(StrEnum):
    X64 = auto()
    X86 = auto()
    ARM = auto()


@dataclass(frozen=True, slots=True)
class Version:
    name: str
    type: VersionType
    architecture_to_guids: Mapping[Architecture, Sequence[str]]
    architecture_to_package: Mapping[Architecture, Path]

    @property
    def display_name(self) -> str:
        if self.type != VersionType.RELEASE:
            return self.name

        major_version, minor_version, patch, *_ = self.name.split(".")
        return (
            f"{major_version}.{minor_version}.{patch[:-2] or "0"}"
            if major_version != "0"
            else f"{major_version}.{minor_version[:2]}.{minor_version[2:].lstrip("0") or "0"}"
        )

    @property
    def available_architectures(self) -> OrderedSet[Architecture]:
        return OrderedSet(self.architecture_to_guids.keys())

    @property
    def pfn(self) -> str:
        return {
            VersionType.RELEASE: "Microsoft.MinecraftUWP_8wekyb3d8bbwe",
            VersionType.BETA: "Microsoft.MinecraftUWP_8wekyb3d8bbwe",
            VersionType.PREVIEW: "Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe",
        }[self.type]

    @property
    def user_sid(self) -> str:
        return {
            VersionType.RELEASE: "S-1-15-2-1958404141-86561845-1752920682-3514627264-368642714-62675701-733520436",
            VersionType.BETA: "S-1-15-2-1958404141-86561845-1752920682-3514627264-368642714-62675701-733520436",
            VersionType.PREVIEW: "S-1-15-2-424268864-5579737-879501358-346833251-474568803-887069379-4040235476",
        }[self.type]

    def is_downloaded(self, architecture: Architecture) -> bool:
        try:
            return self.architecture_to_package[architecture].is_file()
        except KeyError:
            raise UnavailableArchitectureError from None

    def is_installed(self, architecture: Architecture) -> bool:
        if architecture not in self.available_architectures:
            raise UnavailableArchitectureError
        package_dicts = packagemanager.find_packages(self.pfn)
        if not package_dicts:
            return False
        name, publisher_id = self.pfn.split("_")
        return package_dicts[0]["PackageFullName"] == f"{name}_{self.name}_{architecture}__{publisher_id}"


class UnavailableArchitectureError(ValueError):
    pass
