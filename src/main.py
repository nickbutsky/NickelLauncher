from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent / "backend"))

from dataclasses import dataclass

import webview  # pyright: ignore [reportMissingTypeStubs]
from tendo.singleton import SingleInstance

from backend import setup
from backend.bridge import API


@dataclass(frozen=True, slots=True)
class FrontendAPI:
    window: webview.Window

    def reload_main_area(self) -> None:
        self.window.evaluate_js("webview.reloadMainArea()")


def main() -> None:
    me = SingleInstance()  # noqa: F841  # pyright: ignore [reportUnusedVariable]

    window = webview.create_window("NickelLauncher", "bundled-frontend/index.html", js_api=API())

    setup.run(FrontendAPI(window))

    webview.start(debug="__compiled__" not in globals())


if __name__ == "__main__":
    main()
