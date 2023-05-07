from PySide6.QtWidgets import QApplication
from PySide6.QtCore import QObject, QThread


class DebugThread(QThread):
    def __init__(self, parent: QObject | None = None):
        super().__init__(parent)

    def run(self):
        while True:
            objects = QApplication.allWidgets()
            print(*objects, sep='\n')
            print(len(objects))
            print()
            self.sleep(1)
