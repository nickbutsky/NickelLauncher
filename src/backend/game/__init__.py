from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from backend import packagemanager, utility
from backend.cancellationtoken import CancellationTokenSource, Cancelled
from backend.report import Report

from . import step as _step
from .download import download_version

if TYPE_CHECKING:
    from collections.abc import Callable

    from backend.core import Instance


@utility.typed_namespace
class Game:
    _cancellation_token_source: CancellationTokenSource | None = None
    _launched_instance: Instance | None = None

    @property
    def launched_instance(self) -> Instance | None:
        return self._launched_instance

    def run(self, instance: Instance, reporthook: Callable[[Report], object] | None = None) -> None:
        if self.launched_instance:
            error_msg = "Another instance is being launched."
            raise ValueError(error_msg)

        self._cancellation_token_source = CancellationTokenSource()
        self._launched_instance = instance

        logging.info('Launching instance "%s" at "%s"...', instance.name, instance.directory)
        if reporthook:
            reporthook(Report(Report.Type.PROGRESS, "Checking game files..."))
        try:
            _step.grant_access(instance.directory / "com.mojang", instance.version.user_sid)

            if not instance.version.is_downloaded(instance.architecture_choice):
                logging.info("Downloading Minecraft %s...", instance.version.name)
                download_version(
                    instance.version,
                    instance.architecture_choice,
                    self._cancellation_token_source.token,
                    reporthook,
                )

            if not instance.version.is_installed(instance.architecture_choice):
                _step.install(
                    instance.version,
                    instance.architecture_choice,
                    self._cancellation_token_source.token,
                    reporthook,
                )

            _step.relink_game_files(instance, self._cancellation_token_source.token)

            logging.info("Launching Minecraft %s...", instance.version.name)
            if reporthook:
                reporthook(Report(Report.Type.PROGRESS, "Launching Minecraft..."))
            packagemanager.launch_package(instance.version.pfn, "App", self._cancellation_token_source.token)
        except Cancelled:
            pass
        finally:
            self._cancellation_token_source = None
            self._launched_instance = None

    def cancel_launch(self) -> None:
        if not self._cancellation_token_source:
            error_msg = "Nothing is being launched."
            raise ValueError(error_msg)
        self._cancellation_token_source.cancel()
