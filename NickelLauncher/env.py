import os
from pathlib import Path

from customtypes import UserPath


class Root(UserPath):
    @property
    def versions(self) -> Path:
        return self / 'versions'

    @property
    def instances(self) -> Path:
        return self / 'instances'

    @property
    def temp(self) -> Path:
        return self / 'temp'

    @property
    def logs(self) -> Path:
        return self / 'logs'


IS_IN_DEBUG_MODE = not ('__compiled__' in globals())

if IS_IN_DEBUG_MODE:
    ROOT = Root(Path(os.getenv('APPDATA')) / 'NickelLauncherTest')
else:
    ROOT = Root(Path(os.getenv('APPDATA')) / 'NickelLauncher')
