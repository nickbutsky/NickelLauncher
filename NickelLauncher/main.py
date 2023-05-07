import os
import logging
from logging.handlers import RotatingFileHandler

from tendo.singleton import SingleInstance

from env import VERSIONS_DIR_PATH, INSTANCES_DIR_PATH, TEMP_DIR_PATH, LOGS_DIR_PATH, clear_directory
from ui.app import App


class Setup:
    def run(self):
        self._create_dirs()
        Cleaner().run()
        self._setup_rotating_logger(LOGS_DIR_PATH, 'nl')

    @staticmethod
    def _create_dirs():
        os.makedirs(VERSIONS_DIR_PATH, exist_ok=True)
        os.makedirs(INSTANCES_DIR_PATH, exist_ok=True)
        os.makedirs(TEMP_DIR_PATH, exist_ok=True)
        os.makedirs(LOGS_DIR_PATH, exist_ok=True)

    @staticmethod
    def _setup_rotating_logger(log_path: str, base_filename: str):
        def namer(name: str) -> str:
            parent_dir_path, filename = os.path.split(name)
            filename = (filename.replace('.log', '') + '.log').lstrip('.')
            return os.path.join(parent_dir_path, filename)

        handler = RotatingFileHandler(
            os.path.join(log_path, base_filename + '.log'), maxBytes=1024 * 200, backupCount=15
        )
        handler.namer = namer

        logging.basicConfig(
            format='%(asctime)s | %(threadName)-10s | %(levelname)-5s | %(name)-22s | %(lineno)06d | %(message)s',
            level=logging.DEBUG,
            handlers=[handler]
        )


class Cleaner:
    DIRECTORY_PATHS_TO_CLEAN = [TEMP_DIR_PATH]

    def run(self):
        for directory_path in self.DIRECTORY_PATHS_TO_CLEAN:
            clear_directory(directory_path)


def main():
    me = SingleInstance()

    Setup().run()

    app = App()
    app.exec()

    Cleaner().run()


if __name__ == '__main__':
    main()
