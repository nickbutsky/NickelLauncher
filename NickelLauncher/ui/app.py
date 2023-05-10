import os
import sys

import qdarktheme
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import QSettings
from PySide6.QtGui import QIcon

from ui import resources
from ui.mainwindow.mainwindow import MainWindow


class App(QApplication):
    def __init__(self):
        super().__init__(sys.argv)
        self.setOrganizationName('Nickel59')
        self.setApplicationName('NickelLauncher')

        self.setStyleSheet(qdarktheme.load_stylesheet('light'))

        self.setWindowIcon(QIcon(os.path.join(':', 'icons', 'default.png')))

        # from PySide6.QtCore import QTimer
        # from ui.debug_thread import DebugThread
        # self._thread = DebugThread(self)
        # QTimer.singleShot(0, self._thread.start)

    def exec(self) -> int:
        main_window = MainWindow()
        main_window.restoreGeometry(QSettings(self).value('mainwindow/geometry', b''))
        main_window.show()
        main_window.activateWindow()
        return_code = super().exec()
        QSettings(self).setValue('mainwindow/geometry', main_window.saveGeometry())
        main_window.deleteLater()
        return return_code
