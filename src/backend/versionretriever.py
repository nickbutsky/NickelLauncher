from __future__ import annotations

import requests
from pydantic import BaseModel, TypeAdapter, ValidationError

from . import utility
from .core import Architecture, Version
from .path import ROOT_DIRECTORY


@utility.typed_namespace
class VersionRetriever:
    DIRECTORY = ROOT_DIRECTORY / "versions"

    _SUPPORTED_ARCHITECTURES = frozenset({Architecture.X64, Architecture.X86})
    _CONFIG = DIRECTORY / "versions.json"

    _versions = ()

    def get_versions_locally(self) -> tuple[Version, ...]:
        if self._versions:
            return self._versions

        try:
            with (self._CONFIG).open() as f:
                data = f.read()
        except OSError:
            return ()

        self._versions = self._parse_json(data)
        return self._versions

    def get_versions_remotely(self) -> tuple[Version, ...]:
        res = requests.get(
            "https://raw.githubusercontent.com/dummydummy123456/BedrockDB/main/versions.json",
            timeout=10,
        )
        with (self._CONFIG).open("w") as f:
            f.write(res.text)
        self._versions = self._parse_json(res.text)
        return self._versions

    def _parse_json(self, data: str) -> tuple[Version, ...]:
        type_adapter = TypeAdapter(list[_VersionModel])
        try:
            version_models = type_adapter.validate_json(data, strict=True)
        except ValidationError:
            return ()

        return tuple(
            Version(
                version_model.name,
                version_model.type,
                {
                    architecture: guids
                    for architecture, guids in version_model.guids.model_dump().items()
                    if (architecture in self._SUPPORTED_ARCHITECTURES) and guids
                },
                {
                    architecture: self.DIRECTORY / f"{version_model.name}_{architecture}.Appx"
                    for architecture, guids in version_model.guids.model_dump().items()
                    if (architecture in self._SUPPORTED_ARCHITECTURES) and guids
                },
            )
            for version_model in version_models
        )[::-1]


class _VersionModel(BaseModel):
    name: str
    type: Version.Type
    guids: _GuidsModel


class _GuidsModel(BaseModel):
    x64: list[str]
    x86: list[str]
    arm: list[str]
