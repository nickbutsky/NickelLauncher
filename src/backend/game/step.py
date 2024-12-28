from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import TYPE_CHECKING

from backend import packagemanager, shell
from backend.report import Report

if TYPE_CHECKING:
    from collections.abc import Callable

    from backend.cancellationtoken import CancellationToken
    from backend.core import Architecture, Instance, Version


def grant_access(directory: Path, user_sid: str) -> None:
    shell.run_command(f'icacls "{directory}" /grant:r *{user_sid}:(OI)(CI)F /t', log_stdout=False)


def install(
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


def relink_game_files(instance: Instance, cancellation_token: CancellationToken | None = None) -> None:
    logging.debug('Relinking to new game folder at "%s"...', instance.directory / "com.mojang")
    localappdata_path = os.getenv("LOCALAPPDATA")
    if not localappdata_path:
        raise FileNotFoundError
    default_game_directory_parent = Path(localappdata_path) / "Packages" / instance.version.pfn / "LocalState" / "games"
    default_game_directory_parent.mkdir(parents=True, exist_ok=True)
    shell.clear_directory(default_game_directory_parent, cancellation_token)
    (default_game_directory_parent / "com.mojang").symlink_to(instance.directory / "com.mojang", True)
