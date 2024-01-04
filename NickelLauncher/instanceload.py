from typing import TypedDict
from dataclasses import dataclass
import os
import json

from schema import Schema, Or

from env import INSTANCES_DIR_PATH
from core.instance import Instance
from core.instancegroup import InstanceGroup
import versionretrieve


@dataclass(slots=True)
class LoadResult:
    instance_groups: list[InstanceGroup]
    last_instance: Instance | None


def load_instances() -> LoadResult:
    try:
        with open(os.path.join(INSTANCES_DIR_PATH, 'groups.json')) as f:
            contents = json.load(f)
    except (OSError, json.JSONDecodeError):
        return LoadResult(_load_instance_groups([]), None)

    if not _are_groups_json_contents_valid(contents):
        return LoadResult(_load_instance_groups([]), None)

    instance_groups = _load_instance_groups(contents['groups'])
    last_instance = _get_last_instance(contents['last_instance'], instance_groups)
    return LoadResult(instance_groups, last_instance)


def _are_groups_json_contents_valid(contents: dict) -> bool:
    if not Schema(
            {
                'format_version': int,
                'groups': [
                    {
                        'name': str,
                        'hidden': bool,
                        'instances': [str]
                    }
                ],
                'last_instance': Or(str, None)
            }
    ).is_valid(contents):
        return False

    group_names = []
    instance_dir_names = []
    for group_dict in contents['groups']:
        group_names.append(group_dict['name'])
        instance_dir_names += group_dict['instances']

    return (len(group_names) == len(set(group_names))) and (len(instance_dir_names) == len(set(instance_dir_names)))


def _load_instance_groups(
        group_dicts: list[TypedDict('', {'name': str, 'hidden': bool, 'instances': list[str]})]
) -> list[InstanceGroup]:
    grouped_instance_dir_names = []
    for group_dict in group_dicts:
        grouped_instance_dir_names += group_dict['instances']

    ungrouped_instance_dir_names = [
        dir_name for dir_name in os.listdir(INSTANCES_DIR_PATH)
        if os.path.isdir(os.path.join(INSTANCES_DIR_PATH, dir_name)) and dir_name not in grouped_instance_dir_names
    ]

    ungrouped_instances = [
        _load_instance(os.path.join(INSTANCES_DIR_PATH, dir_name)) for dir_name in ungrouped_instance_dir_names
    ]
    ungrouped_instances[:] = [instance for instance in ungrouped_instances if instance is not None]

    groups = [InstanceGroup('', [])]
    for group_dict in group_dicts:
        instances = [_load_instance(os.path.join(INSTANCES_DIR_PATH, dir_name)) for dir_name in group_dict['instances']]
        instances[:] = [instance for instance in instances if instance is not None]

        if group_dict['name'] == '':
            groups[0].instances += instances
        else:
            groups.append(InstanceGroup(group_dict['name'], instances, group_dict['hidden']))

    groups[0].instances += ungrouped_instances

    return [group for group in groups if group.instances]


def _load_instance(path: str) -> Instance | None:
    try:
        with open(Instance.get_config_path(path)) as f:
            config = json.load(f)
    except (OSError, json.JSONDecodeError):
        return None
    if not Schema(
            {
                'format_version': int,
                'name': str,
                'version': {
                    'name': str,
                    'architecture_choice': str
                }
            }
    ).is_valid(config):
        return None
    try:
        version = next(
            v for v in versionretrieve.get_versions_locally()
            if (v.name == config['version']['name'])
            and (config['version']['architecture_choice'] in v.available_architectures)
        )
    except StopIteration:
        return None
    instance = Instance(config['name'], path, version, config['version']['architecture_choice'])
    if not os.path.isdir(instance.minecraft_dir_path):
        return None
    return instance


def _get_last_instance(instance_dir_name: str, instance_groups: list[InstanceGroup]) -> Instance | None:
    for group in instance_groups:
        for instance in group.instances:
            if instance.dir_name == instance_dir_name:
                return instance
    return None
