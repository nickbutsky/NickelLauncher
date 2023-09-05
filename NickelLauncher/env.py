from typing import Sequence
import sys
import os
import shutil
import subprocess
import logging


IS_IN_DEBUG_MODE = not ('__compiled__' in globals())

if IS_IN_DEBUG_MODE:
    LAUNCHER_DATA_DIR_PATH = os.path.join(os.getenv('APPDATA'), 'NickelLauncher')
else:
    LAUNCHER_DATA_DIR_PATH = os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), 'data')

VERSIONS_DIR_PATH = os.path.join(LAUNCHER_DATA_DIR_PATH, 'versions')
INSTANCES_DIR_PATH = os.path.join(LAUNCHER_DATA_DIR_PATH, 'instances')
TEMP_DIR_PATH = os.path.join(LAUNCHER_DATA_DIR_PATH, 'temp')
LOGS_DIR_PATH = os.path.join(LAUNCHER_DATA_DIR_PATH, 'logs')


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
