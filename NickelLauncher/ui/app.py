from pathlib import Path

from PySide6.QtGui import QGuiApplication, QIcon
from PySide6.QtQml import QQmlApplicationEngine


class App(QGuiApplication):
    def __init__(self):
        super().__init__([])
        self.setWindowIcon(QIcon(str(Path(':') / 'icons' / 'default.png')))

    def exec(self) -> int:
        engine = QQmlApplicationEngine('mainwindow.qml')
        if not engine.rootObjects():
            return -1
        return super().exec()
