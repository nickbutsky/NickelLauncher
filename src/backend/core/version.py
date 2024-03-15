from typing import Sequence, Mapping
from enum import StrEnum, auto
from dataclasses import dataclass
from pathlib import Path

from ordered_set import OrderedSet

import packagemanager


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
    guids: Mapping[Architecture, Sequence[str]]
    packages: Mapping[Architecture, Path]

    @property
    def available_architectures(self) -> OrderedSet[Architecture]:
        return OrderedSet(self.guids.keys())

    @property
    def pfn(self) -> str:
        return {
            VersionType.RELEASE: "Microsoft.MinecraftUWP_8wekyb3d8bbwe",
            VersionType.BETA: "Microsoft.MinecraftUWP_8wekyb3d8bbwe",
            VersionType.PREVIEW: "Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe"
        }[self.type]

    @property
    def user_sid(self) -> str:
        return {
            VersionType.RELEASE: "S-1-15-2-1958404141-86561845-1752920682-3514627264-368642714-62675701-733520436",
            VersionType.BETA: "S-1-15-2-1958404141-86561845-1752920682-3514627264-368642714-62675701-733520436",
            VersionType.PREVIEW: "S-1-15-2-424268864-5579737-879501358-346833251-474568803-887069379-4040235476"
        }[self.type]

    def is_downloaded(self, architecture: Architecture) -> bool:
        try:
            return self.packages[architecture].is_file()
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
