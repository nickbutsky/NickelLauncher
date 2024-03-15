from env import ROOT
from core.instance import Instance
import versionretrieve
import stateload as _stateload
import instancecreate as _instancecreate
from watchdogthread import WatchdogThread


_state = _stateload.load_state(ROOT / "instances", versionretrieve.get_versions_locally())
_watchdog = WatchdogThread(ROOT / "instances")

# _watchdog.start()


def create_instance(name: str, instance_group_name: str, version_name: str) -> None:
    _watchdog.ignore_dir_created_event = True
    _instancecreate.create_instance(
        name,
        instance_group_name,
        next(iter(v for v in versionretrieve.get_versions_locally() if v.name == version_name)),
        _state
    )
    _watchdog.ignore_dir_created_event = False


def copy_instance(instance: Instance, copy_worlds: bool) -> None:
    _watchdog.ignore_dir_created_event = True
    _instancecreate.copy_instance(instance, copy_worlds, _state)
    _watchdog.ignore_dir_created_event = False


def change_instance_group(instance: Instance, instance_group_name: str) -> None:
    old_instance_group = next(iter(group for group in _state.instance_groups if instance in group.instances))
    new_instance_group = next(iter(group for group in _state.instance_groups if group.name == instance_group_name))
    if old_instance_group == new_instance_group:
        return
    old_instance_group.move_instances(len(new_instance_group.instances), new_instance_group, [instance])


print(_state.instance_groups)