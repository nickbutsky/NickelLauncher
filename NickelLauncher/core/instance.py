from __future__ import annotations
from typing import Any, Callable, Self
import os
import shutil
import json
import logging

from schema import Schema

import system
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
        self = cls()

        self._name = name.strip()

        self._path = path

        self._versions = version_manager.get_versions(version_name)
        self._architecture_choice = self.available_version_architectures[0]

        os.mkdir(self.minecraft_dir_path)
        self._save_config()

        return self

    @classmethod
    def load(cls, path: str) -> Self | None:
        self = cls()

        self._path = path

        if not os.path.isdir(self.minecraft_dir_path):
            logging.error(f'Failed to load an instance at {path}. No minecraft folder.')
            return None

        try:
            with open(os.path.join(path, 'config.json')) as f:
                config = json.load(f)
        except (OSError, json.JSONDecodeError) as e:
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

        self._name = config['name']

        self._versions = version_manager.get_versions(config['version']['name'])
        self._architecture_choice = config['version']['architecture_choice']

        if (not self._versions) or (self._architecture_choice not in self.available_version_architectures):
            logging.error(f'Failed to load an instance at {path}. Invalid version name in config.')
            return None

        return self

    @classmethod
    def copy(cls, instance: Instance, path: str, copy_worlds: bool = True) -> Self:
        self = cls()

        self._path = path

        def ignore_minecraft_worlds(dir_path: str, dir_list: list[str]) -> list[str]:
            if (dir_path == instance.minecraft_dir_path) and ('minecraftWorlds' in dir_list):
                return ['minecraftWorlds']
            return []

        if copy_worlds:
            shutil.copytree(instance.minecraft_dir_path, self.minecraft_dir_path)
        else:
            shutil.copytree(instance.minecraft_dir_path, self.minecraft_dir_path, ignore=ignore_minecraft_worlds)
            os.mkdir(os.path.join(self.minecraft_dir_path, 'minecraftWorlds'))

        self._name = f'{instance.name}(copy)'

        self._versions = instance._versions
        self._architecture_choice = instance.architecture_choice

        self._save_config()

        return self

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
        self._name = new_name.strip()
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
        with open(os.path.join(self.path, 'config.json'), 'w') as f:
            json.dump(self._to_dict(), f, indent=4)

    def _grant_access(self):
        cmd = f'icacls "{self.path}" /grant:r *{USER_SIDS[self._versions[0].type]}:(OI)(CI)F /t'
        system.run_command(cmd, False)


class UnavailableArchitectureError(ValueError):
    pass


class InvalidVersionName(ValueError):
    pass
