import os
from pathlib import Path


if '__compiled__' in globals():
    ROOT = Path(os.getenv('APPDATA')) / 'NickelLauncher'
else:
    ROOT = Path(__file__).parent.parent
