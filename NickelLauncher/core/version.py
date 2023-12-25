from typing import Any, Callable, Literal
from dataclasses import dataclass
import os
import random
import logging

import system
from report import Report
import packagemanager
from net.versiondownloader import VersionDownloader


PACKAGE_FAMILY_NAMES = {
    'release': 'Microsoft.MinecraftUWP_8wekyb3d8bbwe',
    'beta': 'Microsoft.MinecraftUWP_8wekyb3d8bbwe',
    'preview': 'Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe'
}


@dataclass(frozen=True, slots=True)
class Version:
    name: str
    architecture: str
    type: Literal['release', 'beta', 'preview']
    guids: list[str]
    path: str

    def launch(self, game_dir_path: str, reporthook: Callable[[Report], Any] | None = None):
        if not self._is_downloaded():
            logging.info(f'Downloading Minecraft {self.name}...')
            VersionDownloader(reporthook).download(random.choice(self.guids), self.path)

        if not self._is_installed():
            self._install(reporthook)

        self._relink_game_dir(game_dir_path)

        logging.info(f'Launching Minecraft {self.name}...')
        if reporthook:
            reporthook(Report(Report.PROGRESS, 'Launching the game'))
        packagemanager.launch_package(self._get_pfn(), 'App')

    def _get_pfn(self) -> str:
        return PACKAGE_FAMILY_NAMES[self.type]

    def _is_downloaded(self) -> bool:
        return os.path.isfile(self.path)

    def _is_installed(self) -> bool:
        packages = packagemanager.find_packages(self._get_pfn())
        if not packages:
            return False
        name, publisher_id = self._get_pfn().split('_')
        package_full_name = f'{name}_{self.name}_{self.architecture}__{publisher_id}'
        return package_full_name == packages[0]['PackageFullName']

    def _install(self, reporthook: Callable[[Report], Any] | None = None):
        if reporthook:
            reporthook(Report(Report.PROGRESS, 'Unlinking the old version'))
        for package in packagemanager.find_packages(self._get_pfn()):
            packagemanager.remove_package(package)

        logging.info(f'Installing Minecraft {self.name}...')
        if reporthook:
            reporthook(Report(Report.PROGRESS, f'Installing the game'))
        packagemanager.add_package(self.path)

    def _relink_game_dir(self, game_dir_path: str):
        logging.debug(f'Relinking to a new game folder at "{game_dir_path}"')

        default_instance_dir_path = os.path.join(
            os.getenv('LOCALAPPDATA'), 'Packages', self._get_pfn(), 'LocalState', 'games'
        )
        os.makedirs(default_instance_dir_path, exist_ok=True)
        system.clear_directory(default_instance_dir_path)
        os.symlink(game_dir_path, os.path.join(default_instance_dir_path, 'com.mojang'), target_is_directory=True)
