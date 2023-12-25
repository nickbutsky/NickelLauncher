import os
import json

from schema import Schema
import requests

from env import VERSIONS_DIR_PATH
from core.version import Version


SUPPORTED_ARCHITECTURES = ['x64', 'x86']

_VERSIONS_CONFIG_PATH = os.path.join(VERSIONS_DIR_PATH, 'versions.json')
_VERSIONS_URL = 'https://raw.githubusercontent.com/dummydummy123456/BedrockDB/main/versions.json'

_versions: dict[str, list[Version]]

_is_initialized = False


def get_version_list() -> list[Version]:
    if not _is_initialized:
        _initialize()
    versions = []
    for version_name in _versions:
        versions += _versions[version_name]
    return versions


def get_versions(name: str) -> list[Version]:
    if not _is_initialized:
        _initialize()
    try:
        return _versions[name]
    except KeyError:
        return []


def update_version_list():
    global _versions
    try:
        res = requests.get(_VERSIONS_URL)
    except requests.exceptions.RequestException:
        raise
    with open(_VERSIONS_CONFIG_PATH, 'w') as f:
        f.write(res.text)
    _versions = _load_versions(json.loads(res.text))


def _initialize():
    global _versions, _is_initialized
    _versions = _load_versions(_load_config())
    if not _versions:
        try:
            update_version_list()
        except requests.exceptions.RequestException:
            pass
    _is_initialized = True


def _load_versions(config: list[dict]) -> dict[str, list[Version]]:
    versions = {}
    for item in config:
        versions[item['name']] = [
            Version(
                item['name'],
                architecture,
                item['type'],
                item['guids'][architecture],
                os.path.join(VERSIONS_DIR_PATH, f"{item['name']}_{architecture}.Appx")
            ) for architecture in item['guids']
            if architecture in SUPPORTED_ARCHITECTURES and item['guids'][architecture]
        ]
    return versions


def _load_config() -> list[dict]:
    try:
        with open(_VERSIONS_CONFIG_PATH) as f:
            config = json.load(f)
    except (OSError, json.JSONDecodeError):
        return []

    if not Schema(
        [
            {
                'name': str,
                'type': str,
                'guids': {
                    'x64': [str],
                    'x86': [str],
                    'arm': [str]
                }
            }
        ]
    ).is_valid(config):
        return []
    return config
