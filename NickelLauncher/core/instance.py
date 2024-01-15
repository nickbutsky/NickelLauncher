from pathlib import Path
import json

from customtypes import UserPath
from core.version import Version, Architecture


class InstanceDirectory(UserPath):
    @property
    def com_mojang(self) -> Path:
        return self / 'com.mojang'

    @property
    def config_json(self) -> Path:
        return self / 'config.json'


class Instance:
    def __init__(self, name: str, version: Version, architecture_choice: Architecture, directory: InstanceDirectory):
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
    def name(self, name: str):
        self._name = name.strip()
        self.save_config()

    @property
    def version(self) -> Version:
        return self._version

    @version.setter
    def version(self, version: Version):
        self._version = version
        if self.architecture_choice not in self.version.available_architectures:
            self.architecture_choice = self.version.available_architectures[0]
        self.save_config()

    @property
    def architecture_choice(self) -> Architecture:
        return self._architecture_choice

    @architecture_choice.setter
    def architecture_choice(self, architecture: Architecture):
        if architecture not in self.version.available_architectures:
            raise UnavailableArchitectureError
        self._architecture_choice = architecture
        self.save_config()

    @property
    def directory(self) -> InstanceDirectory:
        return self._directory

    def save_config(self):
        with open(self.directory.config_json, 'w') as f:
            json.dump(self._to_dict(), f, indent=4)

    def _to_dict(self) -> dict:
        return {
            'format_version': 1,
            'name': self.name,
            "version": {
                "name": self.version.name,
                "architecture_choice": self.architecture_choice
            }
        }


class UnavailableArchitectureError(ValueError):
    pass
