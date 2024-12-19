from __future__ import annotations

import shutil
import subprocess
import tempfile
import time
from argparse import ArgumentParser
from pathlib import Path
from urllib import request
from uuid import uuid4
from zipfile import ZipFile

from pydantic import BaseModel


class PackageModel(BaseModel):
    displayName: str  # noqa: N815
    author: AuthorModel
    version: str


class AuthorModel(BaseModel):
    name: str


def main() -> None:
    shutil.rmtree("dist", True)

    with Path("package.json").open() as f:
        data = f.read()
    package_model = PackageModel.model_validate_json(data, strict=True)

    try:
        compile_app(package_model.displayName, package_model.author.name, package_model.version)

        iscc_executable = get_iscc_executable()
        if iscc_executable:
            build_installer(
                iscc_executable,
                package_model.displayName,
                package_model.author.name,
                package_model.version,
            )
    except:
        shutil.rmtree("dist", True)
        raise


def compile_app(name: str, company_name: str, version: str) -> None:
    subprocess.run(("powershell", "vite build"), check=True)  # noqa: S603
    subprocess.run(  # noqa: S603
        (
            "powershell",
            "nuitka",
            f'--output-filename="{name}"',
            f'--company-name="{company_name}"',
            f'--product-version="{version}"',
            f'--file-version="{version}"',
            '--windows-icon-from-ico="icon.ico"',
            '--include-data-files="icon.ico"="icon.ico"',
            '--include-data-dir="bundled-frontend"="bundled-frontend"',
            '--output-dir="dist"',
            "--windows-console-mode=disable",
            "--windows-uac-admin",
            "--standalone",
            "--remove-output",
            "--deployment",
            "src/main.py",
        ),
        check=True,
    )
    shutil.rmtree("bundled-frontend")
    app_dist_directory = Path("dist") / "main.dist"
    new_app_dist_directory = app_dist_directory.with_name(name)
    renamed = False
    for _ in range(3):
        try:
            app_dist_directory.replace(new_app_dist_directory)
            renamed = True
            break
        except PermissionError:
            time.sleep(1)
    if not renamed:
        raise CompileError
    print(f"Compilation: Successfully renamed '{app_dist_directory}' to '{new_app_dist_directory}'.")


def get_iscc_executable() -> Path | None:
    parser = ArgumentParser()
    parser.add_argument("--iscc-path")
    iscc_path = parser.parse_args().iscc_path
    if iscc_path is None:
        return None
    iscc_executable = Path(iscc_path)
    return iscc_executable if iscc_executable.exists() and iscc_executable.name == "ISCC.exe" else None


def build_installer(iscc_executable: Path, name: str, publisher: str, version: str) -> None:
    uninsis_dll = Path("UninsIS.dll")
    if not uninsis_dll.exists():
        archive = Path(tempfile.mkdtemp()) / str(uuid4())
        try:
            request.urlretrieve(
                "https://github.com/Bill-Stewart/UninsIS/releases/download/v1.0.1/UninsIS-1.0.1.zip",
                archive,
            )
        except:  # noqa: TRY203
            raise
        else:
            with ZipFile(archive) as z:
                z.extractall(archive.parent)
            (archive.parent / "UninsIS.dll").replace(uninsis_dll)
        finally:
            shutil.rmtree(archive.parent, True)

    subprocess.run(  # noqa: S603
        (
            "powershell",
            f'&"{iscc_executable}"',
            f'/DAppName="{name}"',
            f'/DAppPublisher="{publisher}"',
            f'/DAppVersion="{version}"',
            "scripts/setup.iss",
        ),
        check=True,
    )


class CompileError(Exception):
    pass


if __name__ == "__main__":
    main()
