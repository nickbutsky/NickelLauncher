from __future__ import annotations

import json
from typing import TYPE_CHECKING

from . import shell

if TYPE_CHECKING:
    from pathlib import Path

    from .cancellationtoken import CancellationToken


def find_packages(
    package_family_name: str,
    cancellation_token: CancellationToken | None = None,
) -> list[dict[object, object]]:
    output = shell.run_command(
        (
            "powershell",
            f'Get-AppxPackage | Where-Object {{$_.PackageFamilyName -eq "{package_family_name}"}} | ConvertTo-Json',
        ),
        cancellation_token,
        False,
    )

    if not output:
        return []

    deserialized_output = json.loads(output)

    if isinstance(deserialized_output, dict):
        return [deserialized_output]
    return deserialized_output


def remove_package(package_dict: dict[object, object], cancellation_token: CancellationToken | None = None) -> None:
    shell.run_command(
        ("powershell", f"Remove-AppxPackage -Package {package_dict['PackageFullName']}"),
        cancellation_token,
    )


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
