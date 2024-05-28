from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent / "backend"))

import webview  # pyright: ignore [reportMissingTypeStubs]
from tendo.singleton import SingleInstance

from backend import setup
from backend.api import API


def main() -> None:
    me = SingleInstance()  # noqa: F841  # pyright: ignore [reportUnusedVariable]

    window = webview.create_window("NickelLauncher", "bundled-frontend/index.html", js_api=API())

    setup.run(lambda: window.evaluate_js("webview.resetMainArea()"))

    webview.start(debug="__compiled__" not in globals())


if __name__ == "__main__":
    main()
