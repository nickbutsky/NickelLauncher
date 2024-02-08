from typing import Sequence
from pathlib import Path
import shutil
import subprocess
import logging

import pathvalidate


def clear_directory(directory: Path):
    for item in directory.iterdir():
        try:
            if item.is_file() or item.is_symlink():
                item.unlink()
            elif item.is_dir():
                shutil.rmtree(item)
        except OSError:
            pass


def create_subdirectory(desired_name: str, parent_directory: Path) -> Path:
    sanitized_name = str(pathvalidate.sanitize_filename(desired_name.strip().replace(' ', '_')))
    if not sanitized_name:
        sanitized_name = '1'

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


def run_command(command: str | bytes | Sequence[str | bytes], log_stdout: bool = True) -> str:
    logging.debug(f'Executing command: {command}')
    result = subprocess.run(command, creationflags=subprocess.CREATE_NO_WINDOW, capture_output=True, text=True)
    if result.stderr:
        logging.error(result.stderr)
        raise subprocess.SubprocessError(result.stderr)
    if log_stdout and result.stdout:
        logging.debug(f'Command result: {result.stdout}')
    return result.stdout
