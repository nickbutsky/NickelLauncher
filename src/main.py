from __future__ import annotations

import json
from dataclasses import dataclass
from typing import TYPE_CHECKING

import webview  # pyright: ignore [reportMissingTypeStubs]
from tendo.singleton import SingleInstance

import backend

if TYPE_CHECKING:
    from backend.report import Report


class FrontendAPI:
    def __init__(self, window: webview.Window) -> None:
        self._window = window
        self._frontend_api_static = FrontendAPIStatic(window)
        self._frontend_api_temporary = FrontendAPITemporary(window)

    @property
    def static(self) -> FrontendAPIStatic:
        return self._frontend_api_static

    @property
    def temporary(self) -> FrontendAPITemporary:
        return self._frontend_api_temporary


@dataclass(frozen=True, slots=True)
class FrontendAPIStatic:
    window: webview.Window

    def reload_main_area(self) -> None:
        self.window.evaluate_js("webview.static.reloadMainArea()")


@dataclass(frozen=True, slots=True)
class FrontendAPITemporary:
    window: webview.Window

    def propel_launch_report(self, report: Report) -> None:
        self.window.evaluate_js(f"webview.temporary.propelLaunchReport({json.dumps(report.to_dict())})")


def main() -> None:
    me = SingleInstance()  # noqa: F841  # pyright: ignore [reportUnusedVariable]

    window = webview.create_window(
        "NickelLauncher",
        "bundled-frontend/index.html",
        js_api=backend.bridge.API(),
        min_size=(548, 610),
    )
    backend.main(FrontendAPI(window))
    webview.start(debug="__compiled__" not in globals())


if __name__ == "__main__":
    main()
