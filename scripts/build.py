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

from pydantic import BaseModel, ConfigDict, alias_generators


class PackageModel(BaseModel):
    display_name: str
    author: AuthorModel
    version: str

    model_config = ConfigDict(alias_generator=alias_generators.to_camel)


class AuthorModel(BaseModel):
    name: str


def main() -> None:
    shutil.rmtree("build", ignore_errors=True)
    shutil.rmtree("dist", ignore_errors=True)

    package_model = PackageModel.model_validate_json(Path("package.json").read_text(), strict=True)

    try:
        compile_app(package_model.display_name, package_model.author.name, package_model.version)

        iscc_executable = get_iscc_executable()
        if iscc_executable:
            build_installer(
                iscc_executable,
                package_model.display_name,
                package_model.author.name,
                package_model.version,
            )
    except:
        shutil.rmtree("build", ignore_errors=True)
        shutil.rmtree("dist", ignore_errors=True)
        raise


def compile_app(name: str, company_name: str, version: str) -> None:
    subprocess.run(("powershell", "vite build"), check=True)
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
            '--include-data-dir="build/bundled-frontend"="bundled-frontend"',
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
    shutil.rmtree("build")
    app_dist_directory = Path("dist") / "main.dist"
    new_app_dist_directory = app_dist_directory.with_name(name)
    renamed = False
    for _ in range(100):
        try:
            app_dist_directory.replace(new_app_dist_directory)
        except PermissionError:
            print(f"Compilation: Couldn't rename '{app_dist_directory}' to '{new_app_dist_directory}'. Trying again.")
            time.sleep(1)
        else:
            renamed = True
            break
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
            shutil.rmtree(archive.parent, ignore_errors=True)

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
