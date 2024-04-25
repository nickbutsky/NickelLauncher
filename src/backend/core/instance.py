from __future__ import annotations
from typing import Any
from pathlib import Path
import json

from core.version import Version, Architecture, UnavailableArchitectureError


class Instance:
    def __init__(self, name: str, version: Version, architecture_choice: Architecture, directory: Path) -> None:
        self._name = name.strip()
        self._version = version
        if architecture_choice not in self.version.available_architectures:
            raise UnavailableArchitectureError
        self._architecture_choice = architecture_choice
        self._directory = directory

    @property
    def name(self) -> str:
        return self._name

    @name.setter
    def name(self, name: str) -> None:
        self._name = name.strip()
        self._save()

    @property
    def version(self) -> Version:
        return self._version

    @version.setter
    def version(self, version: Version) -> None:
        self._version = version
        if self.architecture_choice not in self.version.available_architectures:
            self.architecture_choice = self.version.available_architectures[0]
        self._save()

    @property
    def architecture_choice(self) -> Architecture:
        return self._architecture_choice

    @architecture_choice.setter
    def architecture_choice(self, architecture: Architecture) -> None:
        if architecture not in self.version.available_architectures:
            raise UnavailableArchitectureError
        self._architecture_choice = architecture
        self._save()

    @property
    def directory(self) -> Path:
        return self._directory

    def populate_directory(self) -> None:
        (self.directory / "com.mojang").mkdir()
        self._save()

    def _save(self) -> None:
        with (self.directory / "config.json").open("w") as f:
            json.dump(self._to_dict(), f, indent=2)

    def _to_dict(self) -> dict[str, Any]:
        return {
            "format_version": 1,
            "name": self.name,
            "version": {
                "name": self.version.name,
                "architecture_choice": self.architecture_choice
            }
        }
