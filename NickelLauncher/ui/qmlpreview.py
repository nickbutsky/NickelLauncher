from pathlib import Path
import sys

from PySide6.QtCore import QUrl, QObject
from PySide6.QtGui import QGuiApplication
from PySide6.QtQuick import QQuickView


def run(qml_file: Path, context_properties: dict[str, QObject]):
    app = QGuiApplication()
    view = QQuickView()

    def _handle_errors():
        if not view.status() == QQuickView.Status.Error:
            return
        print(view.errors())
        sys.exit(-1)

    view.statusChanged.connect(_handle_errors)
    view.setResizeMode(QQuickView.ResizeMode.SizeRootObjectToView)

    for context_property_name, context_property_object in context_properties.items():
        view.engine().rootContext().setContextProperty(context_property_name, context_property_object)

    view.setSource(QUrl.fromLocalFile(qml_file))
    view.show()
    app.exec()
