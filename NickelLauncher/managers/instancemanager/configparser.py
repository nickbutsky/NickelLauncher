from dataclasses import dataclass
import os

from schema import Schema, Or

from configmanager import load_config, ConfigLoadError
from core.instance import Instance
from core.instancegroup import InstanceGroup


@dataclass
class ParsedConfig:
    instance_groups: list[InstanceGroup]
    last_instance: Instance | None


def parse_config(config_path: str, instances_dir_path: str) -> ParsedConfig:
    try:
        config = load_config(config_path)
    except ConfigLoadError:
        return ParsedConfig(_load_instance_groups([], instances_dir_path), None)

    if not _is_valid_config(config):
        return ParsedConfig(_load_instance_groups([], instances_dir_path), None)

    instance_groups = _load_instance_groups(config['groups'], instances_dir_path)
    last_instance = _load_last_instance(config['last_instance'], instance_groups)
    return ParsedConfig(instance_groups, last_instance)


def _is_valid_config(config: dict) -> bool:
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
    ).is_valid(config):
        return False

    group_names = []
    instance_dir_names = []
    for group_dict in config['groups']:
        group_names.append(group_dict['name'])
        instance_dir_names += group_dict['instances']

    return (len(group_names) == len(set(group_names))) and (len(instance_dir_names) == len(set(instance_dir_names)))


def _load_instance_groups(group_dicts: list[dict], instances_dir_path: str) -> list[InstanceGroup]:
    groups = [InstanceGroup('', [])]

    processed_instance_dir_names = []
    for group_dict in group_dicts:
        instances = [Instance.load(os.path.join(instances_dir_path, dir_name)) for dir_name in group_dict['instances']]
        instances[:] = [instance for instance in instances if instance is not None]
        processed_instance_dir_names.extend(group_dict['instances'])

        groups.append(InstanceGroup(group_dict['name'], instances, group_dict['hidden']))

    remaining_dir_names = [
        dir_name for dir_name in os.listdir(instances_dir_path)
        if os.path.isdir(os.path.join(instances_dir_path, dir_name)) and dir_name not in processed_instance_dir_names
    ]

    ungrouped_instances = [
        Instance.load(os.path.join(instances_dir_path, dir_name)) for dir_name in remaining_dir_names
    ]
    ungrouped_instances[:] = [instance for instance in ungrouped_instances if instance is not None]
    groups[0].instances = ungrouped_instances

    return [group for group in groups if group.instances]


def _load_last_instance(dir_name: str, instance_groups: list[InstanceGroup]) -> Instance | None:
    for group in instance_groups:
        for instance in group.instances:
            if instance.dir_name == dir_name:
                return instance
    return None
