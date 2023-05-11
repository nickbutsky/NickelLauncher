# -*- coding: utf-8 -*-

################################################################################
## Form generated from reading UI file 'dialogchangegroup.ui'
##
## Created by: Qt User Interface Compiler version 6.5.0
##
## WARNING! All changes made in this file will be lost when recompiling UI file!
################################################################################

from PySide6.QtCore import (QCoreApplication, QDate, QDateTime, QLocale,
    QMetaObject, QObject, QPoint, QRect,
    QSize, QTime, QUrl, Qt)
from PySide6.QtGui import (QBrush, QColor, QConicalGradient, QCursor,
    QFont, QFontDatabase, QGradient, QIcon,
    QImage, QKeySequence, QLinearGradient, QPainter,
    QPalette, QPixmap, QRadialGradient, QTransform)
from PySide6.QtWidgets import (QAbstractButton, QApplication, QComboBox, QDialog,
    QDialogButtonBox, QLabel, QSizePolicy, QVBoxLayout,
    QWidget)

class Ui_DialogChangeGroup(object):
    def setupUi(self, DialogChangeGroup):
        if not DialogChangeGroup.objectName():
            DialogChangeGroup.setObjectName(u"DialogChangeGroup")
        DialogChangeGroup.resize(215, 102)
        self.verticalLayout = QVBoxLayout(DialogChangeGroup)
        self.verticalLayout.setObjectName(u"verticalLayout")
        self.label = QLabel(DialogChangeGroup)
        self.label.setObjectName(u"label")

        self.verticalLayout.addWidget(self.label)

        self.combo_box = QComboBox(DialogChangeGroup)
        self.combo_box.setObjectName(u"combo_box")
        self.combo_box.setEditable(True)

        self.verticalLayout.addWidget(self.combo_box)

        self.dialog_button_box = QDialogButtonBox(DialogChangeGroup)
        self.dialog_button_box.setObjectName(u"dialog_button_box")
        self.dialog_button_box.setLayoutDirection(Qt.LeftToRight)
        self.dialog_button_box.setOrientation(Qt.Horizontal)
        self.dialog_button_box.setStandardButtons(QDialogButtonBox.Cancel|QDialogButtonBox.Ok)

        self.verticalLayout.addWidget(self.dialog_button_box)


        self.retranslateUi(DialogChangeGroup)
        self.dialog_button_box.accepted.connect(DialogChangeGroup.accept)
        self.dialog_button_box.rejected.connect(DialogChangeGroup.reject)

        QMetaObject.connectSlotsByName(DialogChangeGroup)
    # setupUi

    def retranslateUi(self, DialogChangeGroup):
        DialogChangeGroup.setWindowTitle(QCoreApplication.translate("DialogChangeGroup", u"Group name", None))
        self.label.setText(QCoreApplication.translate("DialogChangeGroup", u"Enter a new group name.", None))
    # retranslateUi

