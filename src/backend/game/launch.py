from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import TYPE_CHECKING

import packagemanager
import shell
from cancellationtoken import CancellationTokenSource, Cancelled
from report import Report

from .download import download_version

if TYPE_CHECKING:
    from typing import Callable

    from cancellationtoken import CancellationToken
    from core.instance import Instance
    from core.version import Architecture, Version


def launch(instance: Instance, id_: str, reporthook: Callable[[Report], object] | None = None) -> None:
    if id_ in _cancellation_token_sources:
        error_msg = f'ID "{id_}" is already used.'
        raise ValueError(error_msg)

    cancellation_token_source = CancellationTokenSource()
    _cancellation_token_sources[id_] = cancellation_token_source

    try:
        logging.info('Launching instance "%s" at "%s"...', instance.name, instance.directory)
        if reporthook:
            reporthook(Report(Report.PROGRESS, "Checking game files..."))
        _grant_access(instance.directory, instance.version.user_sid, cancellation_token_source.token)

        if not instance.version.is_downloaded(instance.architecture_choice):
            logging.info("Downloading Minecraft %s...", instance.version.name)
            download_version(
                instance.version,
                instance.architecture_choice,
                cancellation_token_source.token,
                reporthook,
            )

        if not instance.version.is_installed(instance.architecture_choice):
            _install(instance.version, instance.architecture_choice, cancellation_token_source.token, reporthook)

        _relink_game_files(instance, cancellation_token_source.token)

        logging.info("Launching Minecraft %s...", instance.version.name)
        if reporthook:
            reporthook(Report(Report.PROGRESS, "Launching Minecraft..."))
        packagemanager.launch_package(instance.version.pfn, "App", cancellation_token_source.token)
    except Exception as e:
        if not isinstance(e, Cancelled):
            raise
    finally:
        _cancellation_token_sources.pop(id_, None)


def cancel_launch(id_: str) -> None:
    _cancellation_token_sources.pop(id_).cancel()


_cancellation_token_sources: dict[str, CancellationTokenSource] = {}


def _grant_access(directory: Path, user_sid: str, cancellation_token: CancellationToken | None = None) -> None:
    shell.run_command(f'icacls "{directory}" /grant:r *{user_sid}:(OI)(CI)F /t', cancellation_token, False)


def _install(
    version: Version,
    architecture: Architecture,
    cancellation_token: CancellationToken | None = None,
    reporthook: Callable[[Report], object] | None = None,
) -> None:
    if reporthook:
        reporthook(Report(Report.PROGRESS, "Unlinking old version..."))
    for package_dict in packagemanager.find_packages(version.pfn, cancellation_token):
        packagemanager.remove_package(package_dict, cancellation_token)

    logging.info("Installing Minecraft %s...", version.name)
    if reporthook:
        reporthook(Report(Report.PROGRESS, "Installing Minecraft..."))
    packagemanager.add_package(version.packages[architecture], cancellation_token)


def _relink_game_files(instance: Instance, cancellation_token: CancellationToken | None = None) -> None:
    logging.debug('Relinking to new game folder at "%s"...', instance.directory / "com.mojang")
    localappdata_path = os.getenv("LOCALAPPDATA")
    if not localappdata_path:
        raise FileNotFoundError
    default_game_directory_parent = Path(localappdata_path) / "Packages" / instance.version.pfn / "LocalState" / "games"
    default_game_directory_parent.mkdir(parents=True, exist_ok=True)
    shell.clear_directory(default_game_directory_parent, cancellation_token)
    (default_game_directory_parent / "com.mojang").symlink_to(instance.directory / "com.mojang", True)
