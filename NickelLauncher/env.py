import os
from pathlib import Path


ROOT = Path(os.getenv('APPDATA')) / 'NickelLauncherTest' if not ('__compiled__' in globals()) else 'NickelLauncher'
