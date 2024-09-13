from __future__ import annotations

import ctypes
import json
import winreg
from ctypes import wintypes
from dataclasses import dataclass
from typing import TYPE_CHECKING, cast

import webview  # pyright: ignore [reportMissingTypeStubs]
from pydantic import BaseModel, ValidationError
from tendo.singleton import SingleInstance
from webview.platforms.winforms import (  # pyright: ignore [reportMissingTypeStubs]
    BrowserView,
    Icon,  # pyright: ignore [reportAttributeAccessIssue, reportUnknownVariableType]
    WinForms,  # pyright: ignore [reportPrivateImportUsage]
)

import backend

dwmapi = ctypes.windll.LoadLibrary("dwmapi")


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

    def on_sudden_change(self) -> None:
        self.window.evaluate_js("webview.static.onSuddenChange()")


@dataclass(frozen=True, slots=True)
class FrontendAPITemporary:
    window: webview.Window

    def propel_launch_report(self, report: Report) -> None:
        self.window.evaluate_js(f"webview.temporary.propelLaunchReport({json.dumps(report.to_dict())})")


class GeometryModel(BaseModel):
    width: int = 800
    height: int = 600
    x: int | None = None
    y: int | None = None
    maximised: bool = False


def get_geometry_model() -> GeometryModel:
    try:
        with (
            winreg.ConnectRegistry(None, winreg.HKEY_CURRENT_USER) as r,
            winreg.OpenKey(r, r"Software\Nickel59\NickelLauncher") as k,
        ):
            value, type_id = winreg.QueryValueEx(k, "geometry")
    except FileNotFoundError:
        return GeometryModel()
    if type_id != winreg.REG_SZ:
        return GeometryModel()
    try:
        array = json.loads(value)
    except json.JSONDecodeError:
        return GeometryModel()
    if not isinstance(array, list) or len(cast(list[object], array)) != 5:
        return GeometryModel()
    try:
        return GeometryModel.model_validate(
            {"width": array[0], "height": array[1], "x": array[2], "y": array[3], "maximised": array[4]},
            strict=True,
        )
    except ValidationError:
        return GeometryModel()


def save_geometry(window: webview.Window) -> None:
    form = BrowserView.instances[window.uid]  # pyright: ignore [reportUnknownMemberType, reportUnknownVariableType]

    dpi_for_window_to_divisor: dict[int, float] = {96: 1, 120: 1.25, 144: 1.5, 192: 2}
    divisor = dpi_for_window_to_divisor[ctypes.windll.user32.GetDpiForWindow(form.Handle.ToInt32())]  # pyright: ignore [reportUnknownMemberType]

    with (
        winreg.ConnectRegistry(None, winreg.HKEY_CURRENT_USER) as r,
        winreg.CreateKeyEx(r, r"Software\Nickel59\NickelLauncher", access=winreg.KEY_SET_VALUE) as k,
    ):
        winreg.SetValueEx(
            k,
            "geometry",
            0,
            winreg.REG_SZ,
            json.dumps(
                [
                    round(cast(int, form.Size.Width) / divisor),  # pyright: ignore [reportUnknownMemberType]
                    round(cast(int, form.Size.Height) / divisor),  # pyright: ignore [reportUnknownMemberType]
                    form.Location.X,  # pyright: ignore [reportUnknownMemberType]
                    form.Location.Y,  # pyright: ignore [reportUnknownMemberType]
                    False,
                ]
                if form.WindowState == WinForms.FormWindowState.Normal  # pyright: ignore [reportUnknownMemberType]
                else [
                    round(cast(int, form.RestoreBounds.Size.Width) / divisor),  # pyright: ignore [reportUnknownMemberType]
                    round(cast(int, form.RestoreBounds.Size.Height) / divisor),  # pyright: ignore [reportUnknownMemberType]
                    form.RestoreBounds.Location.X,  # pyright: ignore [reportUnknownMemberType]
                    form.RestoreBounds.Location.Y,  # pyright: ignore [reportUnknownMemberType]
                    form.WindowState == WinForms.FormWindowState.Maximized,  # pyright: ignore [reportUnknownMemberType]
                ],
            ),
        )


def main() -> None:
    me = SingleInstance()  # noqa: F841  # pyright: ignore [reportUnusedVariable]

    geometry_model = get_geometry_model()

    window = webview.create_window(
        "NickelLauncher",
        "bundled-frontend/index.html",
        js_api=backend.bridge.API(),
        width=geometry_model.width,
        height=geometry_model.height,
        x=geometry_model.x,
        y=geometry_model.y,
        min_size=(548, 610),
        maximized=geometry_model.maximised,
        background_color="#0a0a0a",
    )

    def on_shown() -> None:
        form = BrowserView.instances[window.uid]  # pyright: ignore [reportUnknownMemberType, reportUnknownVariableType]
        dwmapi.DwmSetWindowAttribute(
            form.Handle.ToInt32(),  # pyright: ignore [reportUnknownMemberType]
            20,
            ctypes.byref(ctypes.c_bool(True)),
            ctypes.sizeof(wintypes.BOOL),
        )
        form.Icon = Icon("icon.ico")

    window.events.shown += on_shown
    window.events.closing += lambda: save_geometry(window)
    backend.main(FrontendAPI(window))
    webview.start(debug="__compiled__" not in globals())


if __name__ == "__main__":
    main()
