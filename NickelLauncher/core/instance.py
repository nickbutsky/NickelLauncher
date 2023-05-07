from typing import Any, Callable, Self
import os
import logging

from schema import Schema

from env import run_command
from configmanager import load_config, save_config, ConfigLoadError
from report import Report
from core.version import Version
import managers.versionmanager as version_manager


USER_SIDS = {
    'release': 'S-1-15-2-1958404141-86561845-1752920682-3514627264-368642714-62675701-733520436',
    'beta': 'S-1-15-2-1958404141-86561845-1752920682-3514627264-368642714-62675701-733520436',
    'preview': 'S-1-15-2-424268864-5579737-879501358-346833251-474568803-887069379-4040235476'
}


class Instance:
    @classmethod
    def create(cls, name: str, path: str, version_name: str) -> Self:
        instance = cls()

        instance._name = name

        instance._path = path

        instance._versions = version_manager.get_versions(version_name)
        instance._architecture_choice = instance.available_version_architectures[0]

        os.mkdir(instance.minecraft_dir_path)
        instance._save_config()

        return instance

    @classmethod
    def load(cls, path: str) -> Self | None:
        instance = cls()

        instance._path = path

        if not os.path.isdir(instance.minecraft_dir_path):
            logging.error(f'Failed to load an instance at {path}. No minecraft folder.')
            return None

        try:
            config = load_config(os.path.join(path, 'config.json'))
        except ConfigLoadError:
            logging.error(f'Failed to load an instance at {path}. Invalid config.')
            return None

        if not Schema(
                {
                    'format_version': int,
                    'name': str,
                    'version': {
                        'name': str,
                        'architecture_choice': str
                    }
                }
        ).is_valid(config):
            logging.error(f'Failed to load an instance at {path}. Invalid config.')
            return None

        instance._name = config['name']

        instance._versions = version_manager.get_versions(config['version']['name'])
        instance._architecture_choice = config['version']['architecture_choice']

        if (not instance._versions) or (instance._architecture_choice not in instance.available_version_architectures):
            logging.error(f'Failed to load an instance at {path}. Invalid version name in config.')
            return None

        return instance

    def __init__(self):
        """
        Returns an empty instance. To create a new instance use Instance.create(), to load an existing one use
        Instance.load().
        """
        self._name = ''

        self._path = ''

        self._versions: list[Version] = []
        self._architecture_choice = ''

    @property
    def name(self) -> str:
        return self._name

    @property
    def dir_name(self) -> str:
        _, dir_name = os.path.split(self.path)
        return dir_name

    @property
    def version_name(self) -> str:
        return self._versions[0].name

    @property
    def architecture_choice(self) -> str:
        return self._architecture_choice

    @property
    def available_version_architectures(self) -> list[str]:
        return [version.architecture for version in self._versions]

    @property
    def path(self) -> str:
        return self._path

    @property
    def minecraft_dir_path(self) -> str:
        return os.path.join(self.path, 'com.mojang')

    def rename(self, new_name: str):
        self._name = new_name
        self._save_config()

    def change_version(self, version_name: str):
        versions = version_manager.get_versions(version_name)
        if not versions:
            raise InvalidVersionName
        self._versions = versions
        if self.architecture_choice not in self.available_version_architectures:
            self.set_architecture_choice(self.available_version_architectures[0])
        self._save_config()

    def set_architecture_choice(self, architecture: str):
        if architecture not in self.available_version_architectures:
            raise UnavailableArchitectureError
        self._architecture_choice = architecture
        self._save_config()

    def launch(self, reporthook: Callable[[Report], Any] | None = None):
        logging.info(f'Launching the instance "{self.name}" at "{self.path}"...')
        if reporthook:
            reporthook(Report(Report.PROGRESS, 'Checking game files'))
        self._grant_access()
        for version in self._versions:
            if version.architecture == self.architecture_choice:
                version.launch(self.minecraft_dir_path, reporthook)
                return

    def _to_dict(self) -> dict:
        return {
            'format_version': 1,
            'name': self.name,
            "version": {
                "name": self.version_name,
                "architecture_choice": self.architecture_choice
            }
        }

    def _save_config(self):
        save_config(self._to_dict(), os.path.join(self.path, 'config.json'))

    def _grant_access(self):
        cmd = f'icacls "{self.path}" /grant:r *{USER_SIDS[self._versions[0].type]}:(OI)(CI)F /t'
        run_command(cmd, False)


class UnavailableArchitectureError(ValueError):
    pass


class InvalidVersionName(ValueError):
    pass
