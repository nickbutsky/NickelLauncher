import os
import json

from new_core.version import Version, Architecture


class Instance:
    def __init__(self, name: str, path: str, version: Version, architecture_choice: Architecture):
        self._name = name.strip()
        self._path = path
        self._version = version
        if architecture_choice not in self.version.available_architectures:
            raise UnavailableArchitectureError
        self._architecture_choice = architecture_choice

    @property
    def name(self) -> str:
        return self._name

    @property
    def dir_name(self) -> str:
        _, dir_name = os.path.split(self.path)
        return dir_name

    @property
    def path(self) -> str:
        return self._path

    @property
    def minecraft_dir_path(self) -> str:
        return os.path.join(self.path, 'com.mojang')

    @property
    def version(self) -> Version:
        return self._version

    @property
    def architecture_choice(self) -> Architecture:
        return self._architecture_choice

    def rename(self, new_name: str):
        self._name = new_name.strip()
        self.save_config()

    def change_version(self, version: Version):
        self._version = version
        if self.architecture_choice not in self.version.available_architectures:
            self.set_architecture_choice(self.version.available_architectures[0])
        self.save_config()

    def set_architecture_choice(self, architecture: Architecture):
        if architecture not in self.version.available_architectures:
            raise UnavailableArchitectureError
        self._architecture_choice = architecture
        self.save_config()

    def save_config(self):
        with open(self.get_config_path(self.path), 'w') as f:
            json.dump(self._to_dict(), f, indent=4)

    @staticmethod
    def get_config_path(instance_path: str):
        return os.path.join(instance_path, 'config.json')

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
