from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from pathlib import Path
from typing import TYPE_CHECKING

from backend import packagemanager, shell
from backend.cancellationtoken import CancellationTokenSource, Cancelled
from backend.report import Report

from .download import download_version

if TYPE_CHECKING:
    from collections.abc import Callable

    from backend.cancellationtoken import CancellationToken
    from backend.core.instance import Instance
    from backend.core.version import Architecture, Version


def get_launched_instance() -> Instance | None:
    return _launching_state.launched_instance


def launch(instance: Instance, reporthook: Callable[[Report], object] | None = None) -> None:
    if get_launched_instance():
        error_msg = "Another instance is being launched."
        raise ValueError(error_msg)

    cancellation_token_source = CancellationTokenSource()
    _launching_state.cancellation_token_source = cancellation_token_source
    _launching_state.launched_instance = instance

    try:
        logging.info('Launching instance "%s" at "%s"...', instance.name, instance.directory)
        if reporthook:
            reporthook(Report(Report.Type.PROGRESS, "Checking game files..."))
        _grant_access(instance.directory / "com.mojang", instance.version.user_sid)

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
            reporthook(Report(Report.Type.PROGRESS, "Launching Minecraft..."))
        packagemanager.launch_package(instance.version.pfn, "App", cancellation_token_source.token)
    except Cancelled:
        pass
    finally:
        _launching_state.cancellation_token_source = None
        _launching_state.launched_instance = None


def cancel_launch() -> None:
    if not _launching_state.cancellation_token_source:
        error_msg = "Nothing is being launched."
        raise ValueError(error_msg)
    _launching_state.cancellation_token_source.cancel()
    _launching_state.cancellation_token_source = None
    _launching_state.launched_instance = None


@dataclass(slots=True)
class _LaunchingState:
    cancellation_token_source: CancellationTokenSource | None
    launched_instance: Instance | None


_launching_state: _LaunchingState = _LaunchingState(None, None)


def _grant_access(directory: Path, user_sid: str) -> None:
    shell.run_command(f'icacls "{directory}" /grant:r *{user_sid}:(OI)(CI)F /t', log_stdout=False)


def _install(
    version: Version,
    architecture: Architecture,
    cancellation_token: CancellationToken | None = None,
    reporthook: Callable[[Report], object] | None = None,
) -> None:
    if reporthook:
        reporthook(Report(Report.Type.PROGRESS, "Unlinking old version..."))
    for package_dict in packagemanager.find_packages(version.pfn, cancellation_token):
        packagemanager.remove_package(package_dict["PackageFullName"], cancellation_token)

    logging.info("Installing Minecraft %s...", version.name)
    if reporthook:
        reporthook(Report(Report.Type.PROGRESS, "Installing Minecraft..."))
    packagemanager.add_package(version.architecture_to_package[architecture], cancellation_token)


def _relink_game_files(instance: Instance, cancellation_token: CancellationToken | None = None) -> None:
    logging.debug('Relinking to new game folder at "%s"...', instance.directory / "com.mojang")
    localappdata_path = os.getenv("LOCALAPPDATA")
    if not localappdata_path:
        raise FileNotFoundError
    default_game_directory_parent = Path(localappdata_path) / "Packages" / instance.version.pfn / "LocalState" / "games"
    default_game_directory_parent.mkdir(parents=True, exist_ok=True)
    shell.clear_directory(default_game_directory_parent, cancellation_token)
    (default_game_directory_parent / "com.mojang").symlink_to(instance.directory / "com.mojang", True)
