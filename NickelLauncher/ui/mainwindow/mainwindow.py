from PySide6.QtWidgets import QWidget, QMainWindow, QToolButton, QMenu
from PySide6.QtCore import QUrl
from PySide6.QtGui import QAction, QDesktopServices

from env import LAUNCHER_DATA_DIR_PATH, INSTANCES_DIR_PATH, VERSIONS_DIR_PATH
from ui.mainwindow.ui_mainwindow import Ui_MainWindow
from managers.instancemanager.instancemanager import InstanceManager
from ui.instanceview.view import InstanceView
from ui.instanceview.presenter import InstanceViewPresenter


class MainWindow(QMainWindow):
    def __init__(self, parent: QWidget | None = None):
        super().__init__(parent)

        instance_view = InstanceView(self)

        self._instance_view_presenter = InstanceViewPresenter(instance_view, InstanceManager())

        self._ui = Ui_MainWindow()
        self._ui.setupUi(self)
        self.setCentralWidget(instance_view)

        menu_folders = QMenu(self)

        def view_instance_folder(): QDesktopServices.openUrl(QUrl.fromLocalFile(INSTANCES_DIR_PATH))
        menu_folders.addAction('View Instance Folder', view_instance_folder)

        def view_version_folder(): QDesktopServices.openUrl(QUrl.fromLocalFile(VERSIONS_DIR_PATH))
        menu_folders.addAction('View Version Folder', view_version_folder)

        def view_launcher_data_folder(): QDesktopServices.openUrl(QUrl.fromLocalFile(LAUNCHER_DATA_DIR_PATH))
        action_view_launcher_data_folder = QAction(self)
        action_view_launcher_data_folder.triggered.connect(view_launcher_data_folder)

        button_folders = QToolButton(self)
        button_folders.setDefaultAction(action_view_launcher_data_folder)
        button_folders.setText('Folders')
        button_folders.setMenu(menu_folders)
        button_folders.setPopupMode(QToolButton.ToolButtonPopupMode.MenuButtonPopup)
        self._ui.toolbar.addWidget(button_folders)

        self._ui.action_add_instance.triggered.connect(self._instance_view_presenter.show_instance_creation_dialog)
        self._instance_view_presenter.run()
