from __future__ import annotations
from typing import TYPE_CHECKING
import json

import shell

if TYPE_CHECKING:
    from typing import Any
    from pathlib import Path


def find_packages(package_family_name: str) -> list[dict[Any, Any]]:
    cmd = (
        "powershell",
        f'Get-AppxPackage | Where-Object {{$_.PackageFamilyName -eq "{package_family_name}"}} | ConvertTo-Json'
    )
    output = shell.run_command(cmd, False)

    if not output:
        return []

    deserialized_output = json.loads(output)

    if isinstance(deserialized_output, dict):
        return [deserialized_output]
    return deserialized_output


def remove_package(package_dict: dict[Any, Any]) -> None:
    package_fullname = package_dict["PackageFullName"]
    cmd = "powershell", f"Remove-AppxPackage -Package {package_fullname}"
    shell.run_command(cmd)


def add_package(package: Path) -> None:
    cmd = "powershell", f'Add-AppxPackage "{package}"'
    shell.run_command(cmd)


def launch_package(package_family_name: str, application_id: str) -> None:
    cmd = "powershell", f"explorer.exe shell:appsFolder\\{package_family_name}!{application_id}"
    shell.run_command(cmd)
