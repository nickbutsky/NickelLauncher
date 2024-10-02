from __future__ import annotations

import json
from typing import TYPE_CHECKING, TypedDict, cast

from . import shell

if TYPE_CHECKING:
    from pathlib import Path

    from .cancellationtoken import CancellationToken


class PackageDict(TypedDict):
    PackageFullName: str


def find_packages(
    package_family_name: str,
    cancellation_token: CancellationToken | None = None,
) -> list[PackageDict]:
    return (
        (
            [cast(PackageDict, deserialized_output)]
            if isinstance((deserialized_output := json.loads(output)), dict)
            else deserialized_output
        )
        if (
            output := shell.run_command(
                (
                    "powershell",
                    f'Get-AppxPackage | Where-Object {{$_.PackageFamilyName -eq "{package_family_name}"}} | ConvertTo-Json',  # noqa: E501
                ),
                cancellation_token,
                False,
            )
        )
        else []
    )


def remove_package(package_full_name: str, cancellation_token: CancellationToken | None = None) -> None:
    shell.run_command(("powershell", f'Remove-AppxPackage -Package "{package_full_name}"'), cancellation_token)


def add_package(package: Path, cancellation_token: CancellationToken | None = None) -> None:
    shell.run_command(("powershell", f'Add-AppxPackage "{package}"'), cancellation_token)


def launch_package(
    package_family_name: str,
    application_id: str,
    cancellation_token: CancellationToken | None = None,
) -> None:
    shell.run_command(
        ("powershell", f"explorer.exe shell:appsFolder\\{package_family_name}!{application_id}"),
        cancellation_token,
    )
