import json

from env import ROOT
from core.instance import Instance
from managerstate import ManagerState


def save_instance(instance: Instance):
    with open(instance.directory / 'config_json', 'w') as f:
        json.dump(instance.to_dict(), f, indent=4)


def save_manager_state(manager_state: ManagerState):
    with open(ROOT / 'instances' / 'groups.json', 'w') as f:
        json.dump(manager_state.to_dict(), f, indent=4)
