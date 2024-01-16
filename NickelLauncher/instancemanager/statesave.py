import json

from state import State
from env import ROOT


def save_state(state: State):
    with open(ROOT / 'instances' / 'groups.json', 'w') as f:
        json.dump(state.to_dict(), f, indent=4)