from typing import Sequence
import os
import shutil
import subprocess
import logging


def clear_directory(path: str):
    for item_name in os.listdir(path):
        item_path = os.path.join(path, item_name)
        try:
            if os.path.isfile(item_path) or os.path.islink(item_path):
                os.unlink(item_path)
            elif os.path.isdir(item_path):
                shutil.rmtree(item_path)
        except OSError:
            pass


def run_command(command: str | bytes | Sequence[str | bytes], log_stdout: bool = True) -> str:
    logging.debug(f'Executing command: {command}')
    result = subprocess.run(command, creationflags=subprocess.CREATE_NO_WINDOW, capture_output=True, text=True)
    if result.stderr:
        logging.error(result.stderr)
        raise subprocess.SubprocessError(result.stderr)
    if log_stdout and result.stdout:
        logging.debug(f'Command result: {result.stdout}')
    return result.stdout
