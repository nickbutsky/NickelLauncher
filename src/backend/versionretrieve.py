from __future__ import annotations

import requests
from pydantic import BaseModel, TypeAdapter, ValidationError

from .core.version import Architecture, Version, VersionType
from .path import ROOT_DIRECTORY

SUPPORTED_ARCHITECTURES = frozenset({Architecture.X64, Architecture.X86})


def get_versions_locally() -> tuple[Version, ...]:
    global _versions  # noqa: PLW0603
    if _versions:
        return _versions

    try:
        with (ROOT_DIRECTORY / "versions" / "versions.json").open() as f:
            data = f.read()
    except OSError:
        data = ""

    _versions = _get_versions_from_json(data)
    return _versions


def get_versions_remotely() -> tuple[Version, ...]:
    global _versions  # noqa: PLW0603
    res = requests.get("https://raw.githubusercontent.com/dummydummy123456/BedrockDB/main/versions.json", timeout=10)
    with (ROOT_DIRECTORY / "versions" / "versions.json").open("w") as f:
        f.write(res.text)
    _versions = _get_versions_from_json(res.text)
    return _versions


_versions: tuple[Version, ...] = ()


class _VersionModel(BaseModel):
    name: str
    type: VersionType
    guids: _GuidsModel


class _GuidsModel(BaseModel):
    x64: list[str]
    x86: list[str]
    arm: list[str]


def _get_versions_from_json(data: str) -> tuple[Version, ...]:
    try:
        version_models = TypeAdapter(list[_VersionModel]).validate_json(data, strict=True)
    except ValidationError:
        return ()

    return tuple(
        Version(
            version_model.name,
            version_model.type,
            {
                architecture: guids
                for architecture, guids in version_model.guids.model_dump().items()
                if (architecture in SUPPORTED_ARCHITECTURES) and guids
            },
            {
                architecture: ROOT_DIRECTORY / "versions" / f"{version_model.name}_{architecture}.Appx"
                for architecture, guids in version_model.guids.model_dump().items()
                if (architecture in SUPPORTED_ARCHITECTURES) and guids
            },
        )
        for version_model in version_models
    )[::-1]
