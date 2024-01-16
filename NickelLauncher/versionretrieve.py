from copy import copy
import json

from schema import Schema
import requests

from env import ROOT
from core.version import Version, Architecture


SUPPORTED_ARCHITECTURES = {Architecture.X64, Architecture.X86}

_versions: list[Version] = []


def get_versions_locally() -> list[Version]:
    global _versions
    if _versions:
        return copy(_versions)
    versions = _parse_versions_json_contents(_load_versions_json())
    _versions = versions
    return copy(_versions)


def get_versions_remotely() -> list[Version]:
    global _versions
    res = requests.get('https://raw.githubusercontent.com/dummydummy123456/BedrockDB/main/versions.json')
    with open(ROOT / 'versions' / 'versions.json', 'w') as f:
        f.write(res.text)
    _versions = _parse_versions_json_contents(json.loads(res.text))
    return copy(_versions)


def _parse_versions_json_contents(contents: list[dict]) -> list[Version]:
    return [
        Version(
            item['name'],
            item['type'],
            {
                architecture: guids for architecture, guids in item['guids'].items()
                if (architecture in SUPPORTED_ARCHITECTURES) and guids
            },
            {
                architecture: ROOT / 'versions' / f"{item['name']}_{architecture}.Appx"
                for architecture, guids in item['guids'].items() if (architecture in SUPPORTED_ARCHITECTURES) and guids
            }
        ) for item in contents
    ]


def _load_versions_json() -> list[dict]:
    try:
        with open(ROOT / 'versions' / 'versions.json') as f:
            contents = json.load(f)
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
    ).is_valid(contents):
        return []
    return contents
