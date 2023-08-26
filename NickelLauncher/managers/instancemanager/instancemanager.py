from typing import Any, Callable
import os

from pathvalidate import sanitize_filename

from configmanager import save_config
from env import INSTANCES_DIR_PATH
from core.instance import Instance
from core.instancegroup import InstanceGroup
from managers.instancemanager.configparser import parse_config
from managers.instancemanager.watchdogthread import WatchdogThread


class InstanceManager:
    def __init__(self):
        self._config_path = os.path.join(INSTANCES_DIR_PATH, 'groups.json')
        parsed_config = parse_config(self._config_path, INSTANCES_DIR_PATH)

        self._instance_groups = parsed_config.instance_groups
        self._last_instance = parsed_config.last_instance

        self._to_call_on_state_change: list[Callable[[], Any]] = []

        def callback():
            self._reload()
            self._emit_notification()
        self._watchdog_thread = WatchdogThread(INSTANCES_DIR_PATH)
        self._watchdog_thread.changed.connect(callback)
        self._watchdog_thread.start()

    def get_instance_groups(self) -> list[InstanceGroup]:
        return self._instance_groups

    def create_instance(self, name: str, group_name: str, version_name: str):
        name = name.strip()
        group_name = group_name.strip()

        self._watchdog_thread.ignore_dir_created_event = True

        path = os.path.join(INSTANCES_DIR_PATH, self._name_to_dir_name(name))
        os.mkdir(path)

        instance = Instance.create(name, path, version_name)

        if group := self._get_group(group_name):
            group.instances.append(instance)
        else:
            self._create_group(group_name, instance)

        self.set_last_instance(instance)

        self._watchdog_thread.ignore_dir_created_event = False

    def get_last_instance(self) -> Instance | None:
        return self._last_instance

    def set_last_instance(self, instance: Instance):
        self._last_instance = instance
        self._save_config()

    def set_group_hidden(self, name: str, hidden: bool):
        self._get_group(name).hidden = hidden
        self._save_config()

    def change_instance_group(self, instance: Instance, group_name: str):
        self._remove_instance_from_group(instance)

        group_name = group_name.strip()

        group = self._get_group(group_name)
        if group:
            group.instances.append(instance)
        else:
            self._instance_groups.append(InstanceGroup(group_name, [instance]))
        self._delete_empty_groups()
        self._save_config()

    def subscribe_to_state_change_notifications(self, callback: Callable[[], Any]):
        if callback not in self._to_call_on_state_change:
            self._to_call_on_state_change.append(callback)

    def _get_group(self, name: str) -> InstanceGroup | None:
        for group in self._instance_groups:
            if group.name == name:
                return group
        return None

    def _create_group(self, name: str, instance: Instance):
        name = name.strip()

        if self._get_group(name):
            raise GroupExistsError

        group = InstanceGroup(name, [instance])

        if name == '':
            self._instance_groups.insert(0, group)
        else:
            self._instance_groups.append(group)

    def _remove_instance_from_group(self, instance: Instance):
        for group in self._instance_groups:
            for instance_ in group.instances:
                if instance_ == instance:
                    group.instances.remove(instance)
                    return

    def _delete_empty_groups(self):
        self._instance_groups[:] = [group for group in self._instance_groups if group.instances]

    def _emit_notification(self):
        for function in self._to_call_on_state_change:
            function()

    def _reload(self):
        parsed_config = parse_config(self._config_path, INSTANCES_DIR_PATH)

        self._instance_groups = parsed_config.instance_groups
        self._last_instance = parsed_config.last_instance

    def _save_config(self):
        save_config(self._to_dict(), self._config_path, True)

    def _to_dict(self) -> dict:
        return {
            'format_version': 1,
            'groups': [group.to_dict() for group in self._instance_groups if group.name],
            'last_instance': self._last_instance.dir_name if self._last_instance else None
        }

    @staticmethod
    def _name_to_dir_name(name: str) -> str:
        dir_name = name
        dir_name = dir_name.replace(' ', '_')
        dir_name = sanitize_filename(dir_name)
        if not dir_name:
            dir_name = '1'

        temp_dir_name = dir_name
        i = 1
        while True:
            for item in os.listdir(INSTANCES_DIR_PATH):
                if temp_dir_name == item:
                    temp_dir_name = dir_name + str(i)
                    i += 1
                    break
            else:
                break

        return temp_dir_name


class GroupExistsError(ValueError):
    pass
