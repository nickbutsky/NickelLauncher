# -*- coding: utf-8 -*-

################################################################################
## Form generated from reading UI file 'dialoglaunch.ui'
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
from PySide6.QtWidgets import (QApplication, QDialog, QLabel, QProgressBar,
    QPushButton, QSizePolicy, QVBoxLayout, QWidget)

class Ui_DialogLaunch(object):
    def setupUi(self, DialogLaunch):
        if not DialogLaunch.objectName():
            DialogLaunch.setObjectName(u"DialogLaunch")
        DialogLaunch.resize(400, 104)
        sizePolicy = QSizePolicy(QSizePolicy.Fixed, QSizePolicy.Fixed)
        sizePolicy.setHorizontalStretch(0)
        sizePolicy.setVerticalStretch(0)
        sizePolicy.setHeightForWidth(DialogLaunch.sizePolicy().hasHeightForWidth())
        DialogLaunch.setSizePolicy(sizePolicy)
        DialogLaunch.setContextMenuPolicy(Qt.NoContextMenu)
        self.verticalLayout = QVBoxLayout(DialogLaunch)
        self.verticalLayout.setObjectName(u"verticalLayout")
        self.label = QLabel(DialogLaunch)
        self.label.setObjectName(u"label")

        self.verticalLayout.addWidget(self.label)

        self.progress_bar = QProgressBar(DialogLaunch)
        self.progress_bar.setObjectName(u"progress_bar")
        self.progress_bar.setValue(0)
        self.progress_bar.setTextVisible(False)

        self.verticalLayout.addWidget(self.progress_bar)

        self.button = QPushButton(DialogLaunch)
        self.button.setObjectName(u"button")

        self.verticalLayout.addWidget(self.button)


        self.retranslateUi(DialogLaunch)

        QMetaObject.connectSlotsByName(DialogLaunch)
    # setupUi

    def retranslateUi(self, DialogLaunch):
        DialogLaunch.setWindowTitle(QCoreApplication.translate("DialogLaunch", u"Please wait...", None))
        self.label.setText("")
        self.button.setText(QCoreApplication.translate("DialogLaunch", u"Abort", None))
    # retranslateUi

