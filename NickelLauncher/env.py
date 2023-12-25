import os

IS_IN_DEBUG_MODE = not ('__compiled__' in globals())

if IS_IN_DEBUG_MODE:
    LAUNCHER_DATA_DIR_PATH = os.path.join(os.getenv('APPDATA'), 'NickelLauncherTest')
else:
    LAUNCHER_DATA_DIR_PATH = os.path.join(os.getenv('APPDATA'), 'NickelLauncher')

VERSIONS_DIR_PATH = os.path.join(LAUNCHER_DATA_DIR_PATH, 'versions')
INSTANCES_DIR_PATH = os.path.join(LAUNCHER_DATA_DIR_PATH, 'instances')
TEMP_DIR_PATH = os.path.join(LAUNCHER_DATA_DIR_PATH, 'temp')
LOGS_DIR_PATH = os.path.join(LAUNCHER_DATA_DIR_PATH, 'logs')
