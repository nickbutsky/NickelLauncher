from typing import Iterable, TypedDict
from pathlib import Path
import json

from schema import Schema, Or

from state import State
from core.instance import Instance
from core.instancegroup import InstanceGroup
from core.version import Version


def load_state(directory: Path, versions: Iterable[Version]) -> State:
    try:
        with open(directory / 'groups.json') as f:
            contents = json.load(f)
    except (OSError, json.JSONDecodeError):
        return State(_load_instance_groups([], directory, versions), None, directory)

    if not _are_groups_json_contents_valid(contents):
        return State(_load_instance_groups([], directory, versions), None, directory)

    instance_groups = _load_instance_groups(contents['groups'], directory, versions)
    last_instance = _get_last_instance(contents['last_instance'], instance_groups)
    return State(instance_groups, last_instance, directory)


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
        group_names.append(group_dict['name'].strip())
        instance_dir_names += group_dict['instances']

    return (len(group_names) == len(set(group_names))) and (len(instance_dir_names) == len(set(instance_dir_names)))


def _load_instance_groups(
        group_dicts: list[TypedDict('', {'name': str, 'hidden': bool, 'instances': list[str]})],
        directory: Path,
        versions: Iterable[Version]
) -> list[InstanceGroup]:
    # The only unpacking way my typechecker recognises
    grouped_instance_dirs = [
        directory for sublist in [
            [directory / dir_name for dir_name in group_dict['instances']] for group_dict in group_dicts
        ] for directory in sublist
    ]

    ungrouped_instance_dirs = [
        item for item in directory.iterdir() if item.is_dir() and item not in grouped_instance_dirs
    ]

    ungrouped_instances = [
        instance for instance in [
            _load_instance(directory, versions) for directory in ungrouped_instance_dirs
        ] if instance is not None
    ]

    groups = []
    for group_dict in group_dicts:
        instances = [
            instance for instance in [
                _load_instance(directory / dir_name, versions) for dir_name in group_dict['instances']
            ] if instance is not None
        ]
        if group_dict['name'] == '':
            groups.insert(0, InstanceGroup('', instances + ungrouped_instances))
        else:
            groups.append(InstanceGroup(group_dict['name'], instances, group_dict['hidden']))

    return [group for group in groups if group.instances] if groups else [InstanceGroup('', ungrouped_instances)]


def _load_instance(instance_directory: Path, versions: Iterable[Version]) -> Instance | None:
    try:
        with open(instance_directory / 'config.json') as f:
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
            v for v in versions if (v.name == config['version']['name'])
            and (config['version']['architecture_choice'] in v.available_architectures)
        )
    except StopIteration:
        return None
    instance = Instance(config['name'], version, config['version']['architecture_choice'], instance_directory)
    return instance if (instance_directory / 'com.mojang').is_dir() else None


def _get_last_instance(instance_dir_name: str, instance_groups: list[InstanceGroup]) -> Instance | None:
    for group in instance_groups:
        for instance in group.instances:
            if instance.directory.name == instance_dir_name:
                return instance
    return None
