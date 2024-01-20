from typing import Callable, Any
from pathlib import Path
import os
import logging

import shell
import packagemanager
from report import Report
from core.instance import Instance
from core.version import Version, Architecture
import gamedownload


def launch(instance: Instance, reporthook: Callable[[Report], Any] | None = None):
    logging.info(f'Launching the instance "{instance.name}" at "{instance.directory}"...')
    if reporthook:
        reporthook(Report(Report.PROGRESS, 'Checking game files'))

    _grant_access(instance.directory, instance.version.user_sid)

    if not instance.version.is_downloaded(instance.architecture_choice):
        logging.info(f'Downloading Minecraft {instance.version.name}...')
        gamedownload.download(instance.version, instance.architecture_choice, reporthook)

    if not instance.version.is_installed(instance.architecture_choice):
        _install(instance.version, instance.architecture_choice, reporthook)

    _relink_game_files(instance)

    logging.info(f'Launching Minecraft {instance.directory.name}...')
    if reporthook:
        reporthook(Report(Report.PROGRESS, 'Launching the game'))
    packagemanager.launch_package(instance.version.pfn, 'App')


def _grant_access(directory: Path, user_sid: str):
    cmd = f'icacls "{directory}" /grant:r *{user_sid}:(OI)(CI)F /t'
    shell.run_command(cmd, False)


def _install(version: Version, architecture: Architecture, reporthook: Callable[[Report], Any] | None = None):
    if reporthook:
        reporthook(Report(Report.PROGRESS, 'Unlinking the old version'))
    for package_dict in packagemanager.find_packages(version.pfn):
        packagemanager.remove_package(package_dict)

    logging.info(f'Installing Minecraft {version.name}...')
    if reporthook:
        reporthook(Report(Report.PROGRESS, f'Installing the game'))
    packagemanager.add_package(version.packages[architecture])


def _relink_game_files(instance: Instance):
    logging.debug(f'Relinking to a new game folder at "{instance.directory / "com.mojang"}"')

    default_game_directory_parent = (
            Path(os.getenv('LOCALAPPDATA')) / 'Packages' / instance.version.pfn / 'LocalState' / 'games'
    )

    default_game_directory_parent.mkdir(parents=True, exist_ok=True)
    shell.clear_directory(default_game_directory_parent)

    (default_game_directory_parent / 'com.mojang').symlink_to(instance.directory / 'com.mojang', True)
