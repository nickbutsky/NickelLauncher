from typing import TypedDict
from dataclasses import dataclass
import json

from schema import Schema, Or

from env import ROOT
from core.instance import Instance, InstanceDirectory
from core.instancegroup import InstanceGroup
import versionretrieve


@dataclass(slots=True)
class LoadResult:
    instance_groups: list[InstanceGroup]
    last_instance: Instance | None


def load_instances() -> LoadResult:
    try:
        with open(ROOT.instances / 'groups.json') as f:
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
    # The only unpacking way my typechecker recognises
    grouped_instance_dirs = [
        directory for sublist in [
            [
                InstanceDirectory(ROOT.instances / dir_name) for dir_name in group_dict['instances']
            ] for group_dict in group_dicts
        ] for directory in sublist
    ]

    ungrouped_instance_dirs = [
        InstanceDirectory(item) for item in ROOT.instances.iterdir()
        if item.is_dir() and item not in grouped_instance_dirs
    ]

    ungrouped_instances = [
        instance for instance in [
            _load_instance(directory) for directory in ungrouped_instance_dirs
        ] if instance is not None
    ]

    groups = [InstanceGroup('', [])]
    for group_dict in group_dicts:
        instances = [
            instance for instance in [
                _load_instance(InstanceDirectory(ROOT.instances / dir_name)) for dir_name in group_dict['instances']
            ] if instance is not None
        ]

        if group_dict['name'] == '':
            groups[0].instances += instances
        else:
            groups.append(InstanceGroup(group_dict['name'], instances, group_dict['hidden']))

    groups[0].instances += ungrouped_instances

    return [group for group in groups if group.instances]


def _load_instance(instance_directory: InstanceDirectory) -> Instance | None:
    try:
        with open(instance_directory.config_json) as f:
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
    instance = Instance(config['name'], version, config['version']['architecture_choice'], instance_directory)
    if not instance_directory.com_mojang.is_dir():
        return None
    return instance


def _get_last_instance(instance_dir_name: str, instance_groups: list[InstanceGroup]) -> Instance | None:
    for group in instance_groups:
        for instance in group.instances:
            if instance.directory.name == instance_dir_name:
                return instance
    return None
