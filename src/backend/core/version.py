from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum, auto
from typing import TYPE_CHECKING

from ordered_set import OrderedSet

from backend import packagemanager

from . import UnavailableArchitectureError

if TYPE_CHECKING:
    from collections.abc import Mapping, Sequence
    from pathlib import Path

    from . import Architecture


@dataclass(frozen=True, slots=True)
class Version:
    name: str
    type: Type
    architecture_to_guids: Mapping[Architecture, Sequence[str]]
    architecture_to_package: Mapping[Architecture, Path]

    class Type(StrEnum):
        RELEASE = auto()
        BETA = auto()
        PREVIEW = auto()

    @property
    def display_name(self) -> str:
        if self.type != self.Type.RELEASE:
            return self.name

        major_version, minor_version, patch, *_ = self.name.split(".")
        return (
            f"{major_version}.{minor_version[:2]}.{minor_version[2:].lstrip("0") or "0"}"
            if major_version == "0"
            else f"{major_version}.{minor_version}.{patch[:-2] or "0"}"
        )

    @property
    def available_architectures(self) -> OrderedSet[Architecture]:
        return OrderedSet(self.architecture_to_guids.keys())

    @property
    def pfn(self) -> str:
        return {
            self.Type.RELEASE: "Microsoft.MinecraftUWP_8wekyb3d8bbwe",
            self.Type.BETA: "Microsoft.MinecraftUWP_8wekyb3d8bbwe",
            self.Type.PREVIEW: "Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe",
        }[self.type]

    @property
    def user_sid(self) -> str:
        return {
            self.Type.RELEASE: "S-1-15-2-1958404141-86561845-1752920682-3514627264-368642714-62675701-733520436",
            self.Type.BETA: "S-1-15-2-1958404141-86561845-1752920682-3514627264-368642714-62675701-733520436",
            self.Type.PREVIEW: "S-1-15-2-424268864-5579737-879501358-346833251-474568803-887069379-4040235476",
        }[self.type]

    def is_downloaded(self, architecture: Architecture) -> bool:
        try:
            package = self.architecture_to_package[architecture]
        except KeyError:
            raise UnavailableArchitectureError from None
        return package.is_file()

    def is_installed(self, architecture: Architecture) -> bool:
        if architecture not in self.available_architectures:
            raise UnavailableArchitectureError
        package_dicts = packagemanager.find_packages(self.pfn)
        if not package_dicts:
            return False
        name, publisher_id = self.pfn.split("_")
        return package_dicts[0]["PackageFullName"] == f"{name}_{self.name}_{architecture}__{publisher_id}"
