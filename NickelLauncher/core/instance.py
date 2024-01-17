from pathlib import Path
import json

from core.version import Version, Architecture


class Instance:
    def __init__(self, name: str, version: Version, architecture_choice: Architecture, directory: Path):
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
        self._save()

    @property
    def version(self) -> Version:
        return self._version

    @version.setter
    def version(self, version: Version):
        self._version = version
        if self.architecture_choice not in self.version.available_architectures:
            self.architecture_choice = self.version.available_architectures[0]
        self._save()

    @property
    def architecture_choice(self) -> Architecture:
        return self._architecture_choice

    @architecture_choice.setter
    def architecture_choice(self, architecture: Architecture):
        if architecture not in self.version.available_architectures:
            raise UnavailableArchitectureError
        self._architecture_choice = architecture
        self._save()

    @property
    def directory(self) -> Path:
        return self._directory

    def _save(self):
        with open(self.directory / 'config.json', 'w') as f:
            json.dump(self._to_dict(), f, indent=4)

    def _to_dict(self) -> dict:
        return {
            'format_version': 1,
            'name': self.name,
            'version': {
                'name': self.version.name,
                'architecture_choice': self.architecture_choice
            }
        }


class UnavailableArchitectureError(ValueError):
    pass
