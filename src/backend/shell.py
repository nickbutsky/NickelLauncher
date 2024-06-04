from __future__ import annotations

import logging
import shutil
import subprocess
from typing import TYPE_CHECKING

import pathvalidate

from cancellationtoken import Cancelled

if TYPE_CHECKING:
    from pathlib import Path
    from typing import Sequence

    from cancellationtoken import CancellationToken


def clear_directory(directory: Path, cancellation_token: CancellationToken | None = None) -> None:
    for item in directory.iterdir():
        if cancellation_token:
            cancellation_token.check()
        try:
            if item.is_file() or item.is_symlink():
                item.unlink()
            elif item.is_dir():
                shutil.rmtree(item)
        except OSError:
            pass


def create_subdirectory(desired_name: str, parent_directory: Path) -> Path:
    sanitized_name = str(pathvalidate.sanitize_filename(desired_name.strip().replace(" ", "_")))
    if not sanitized_name:
        sanitized_name = "1"

    name = sanitized_name
    i = 1
    while True:
        for item in parent_directory.iterdir():
            if name == item.name:
                name = sanitized_name + str(i)
                i += 1
                break
        else:
            break
    subdirectory = parent_directory / name
    subdirectory.mkdir()
    return subdirectory


def run_command(
    command: str | bytes | Sequence[str | bytes],
    cancellation_token: CancellationToken | None = None,
    log_stdout: bool = True,
) -> str:
    logging.debug("Executing command: %s", command)
    with subprocess.Popen(
        command,  # noqa: S603
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        creationflags=subprocess.CREATE_NO_WINDOW,
        text=True,
    ) as process:
        if cancellation_token:
            try:
                while process.poll() is None:
                    cancellation_token.check()
            except Cancelled:
                process.terminate()
                raise

        stdout, stderr = process.communicate()

        if process.returncode:
            error_msg = stderr if stderr else f"The process finished with the code {process.returncode}."
            logging.error(error_msg)
            raise subprocess.SubprocessError(error_msg)

        if log_stdout and stdout:
            logging.debug("Command result: %s", stdout)

        return stdout
