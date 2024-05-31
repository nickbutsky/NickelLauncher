from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import TYPE_CHECKING

import webview  # pyright: ignore [reportMissingTypeStubs]
from tendo.singleton import SingleInstance

sys.path.append(str(Path(__file__).parent / "backend"))

import backend.main

if TYPE_CHECKING:
    from backend.report import Report


@dataclass(frozen=True, slots=True)
class FrontendAPI:
    window: webview.Window

    def reload_main_area(self) -> None:
        self.window.evaluate_js("webview.reloadMainArea()")

    def propel_launch_report(self, report: Report) -> None:
        self.window.evaluate_js(f"webview.propelLaunchReport({json.dumps(report.to_dict())})")


def main() -> None:
    me = SingleInstance()  # noqa: F841  # pyright: ignore [reportUnusedVariable]

    window = webview.create_window("NickelLauncher", "bundled-frontend/index.html", js_api=backend.main.bridge.API())
    backend.main.main(frontend_api=FrontendAPI(window))
    webview.start(debug="__compiled__" not in globals())


if __name__ == "__main__":
    main()
