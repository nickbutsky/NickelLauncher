from typing import TypedDict
import json

from schema import Schema  # type: ignore
import requests

from env import ROOT
from core.version import Version, VersionType, Architecture


SUPPORTED_ARCHITECTURES = frozenset({Architecture.X64, Architecture.X86})

_versions: tuple[Version, ...] = ()


def get_versions_locally() -> tuple[Version, ...]:
    global _versions
    if _versions:
        return _versions
    _versions = _parse_versions_json_contents(_load_versions_json())
    return _versions


def get_versions_remotely() -> tuple[Version, ...]:
    global _versions
    res = requests.get('https://raw.githubusercontent.com/dummydummy123456/BedrockDB/main/versions.json')
    with open(ROOT / 'versions' / 'versions.json', 'w') as f:
        f.write(res.text)
    _versions = _parse_versions_json_contents(json.loads(res.text))
    return _versions


class _Guids(TypedDict):
    x64: list[str]
    x86: list[str]
    arm: list[str]


class _VersionDict(TypedDict):
    name: str
    type: VersionType
    guids: _Guids


def _parse_versions_json_contents(contents: list[_VersionDict]) -> tuple[Version, ...]:
    return tuple(
        Version(
            item['name'],
            item['type'],
            {
                architecture: guids for architecture, guids in item['guids'].items()  # type: ignore
                if (architecture in SUPPORTED_ARCHITECTURES) and guids
            },
            {
                architecture: ROOT / 'versions' / f"{item['name']}_{architecture}.Appx"
                for architecture, guids in item['guids'].items() if (architecture in SUPPORTED_ARCHITECTURES) and guids
            }
        ) for item in contents
    )[::-1]


def _load_versions_json() -> list[_VersionDict]:
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
    ).is_valid(contents):  # type: ignore
        return []
    return contents
