import json

import env


def find_packages(package_family_name: str) -> list[dict]:
    cmd = (
        'powershell',
        f'Get-AppxPackage | Where-Object {{$_.PackageFamilyName -eq "{package_family_name}"}} | convertto-json'
    )
    output = env.run_command(cmd, False)

    if output:
        deserialized_output = json.loads(output)
    else:
        deserialized_output = []

    if isinstance(deserialized_output, dict):
        return [deserialized_output]
    else:
        return deserialized_output


def remove_package(package_dict: dict):
    package_fullname = package_dict['PackageFullName']
    cmd = 'powershell', f'Remove-AppxPackage -Package {package_fullname}'
    env.run_command(cmd)


def add_package(path: str):
    cmd = 'powershell', f'Add-AppxPackage "{path}"'
    env.run_command(cmd)


def launch_package(package_family_name: str, application_id: str):
    cmd = 'powershell', f'explorer.exe shell:appsFolder\\{package_family_name}!{application_id}'
    env.run_command(cmd)
