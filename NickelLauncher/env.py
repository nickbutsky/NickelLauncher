import os
from pathlib import Path


class Root(type(Path())):
    @property
    def versions(self) -> Path:
        return Path(self) / 'versions'

    @property
    def instances(self) -> Path:
        return Path(self) / 'instances'

    @property
    def temp(self) -> Path:
        return Path(self) / 'temp'

    @property
    def logs(self) -> Path:
        return Path(self) / 'logs'


IS_IN_DEBUG_MODE = not ('__compiled__' in globals())

if IS_IN_DEBUG_MODE:
    ROOT = Root(Path(os.getenv('APPDATA')) / 'NickelLauncherTest')
else:
    ROOT = Root(Path(os.getenv('APPDATA')) / 'NickelLauncher')
