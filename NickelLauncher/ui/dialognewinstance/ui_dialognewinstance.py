# -*- coding: utf-8 -*-

################################################################################
## Form generated from reading UI file 'dialognewinstance.ui'
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
    QDialogButtonBox, QFormLayout, QLabel, QLineEdit,
    QSizePolicy, QVBoxLayout, QWidget)

class Ui_DialogNewInstance(object):
    def setupUi(self, DialogNewInstance):
        if not DialogNewInstance.objectName():
            DialogNewInstance.setObjectName(u"DialogNewInstance")
        DialogNewInstance.resize(700, 500)
        self.vertical_layout = QVBoxLayout(DialogNewInstance)
        self.vertical_layout.setObjectName(u"vertical_layout")
        self.layout_name_input = QFormLayout()
        self.layout_name_input.setObjectName(u"layout_name_input")
        self.label = QLabel(DialogNewInstance)
        self.label.setObjectName(u"label")
        self.label.setMinimumSize(QSize(33, 22))

        self.layout_name_input.setWidget(0, QFormLayout.LabelRole, self.label)

        self.label_2 = QLabel(DialogNewInstance)
        self.label_2.setObjectName(u"label_2")
        self.label_2.setMinimumSize(QSize(34, 22))

        self.layout_name_input.setWidget(1, QFormLayout.LabelRole, self.label_2)

        self.edit_name = QLineEdit(DialogNewInstance)
        self.edit_name.setObjectName(u"edit_name")
        self.edit_name.setMinimumSize(QSize(137, 22))
        self.edit_name.setMaxLength(250)

        self.layout_name_input.setWidget(0, QFormLayout.FieldRole, self.edit_name)

        self.combo_box_group = QComboBox(DialogNewInstance)
        self.combo_box_group.setObjectName(u"combo_box_group")
        self.combo_box_group.setEditable(True)

        self.layout_name_input.setWidget(1, QFormLayout.FieldRole, self.combo_box_group)


        self.vertical_layout.addLayout(self.layout_name_input)

        self.button_box = QDialogButtonBox(DialogNewInstance)
        self.button_box.setObjectName(u"button_box")
        self.button_box.setStandardButtons(QDialogButtonBox.Cancel|QDialogButtonBox.Ok)

        self.vertical_layout.addWidget(self.button_box)


        self.retranslateUi(DialogNewInstance)

        QMetaObject.connectSlotsByName(DialogNewInstance)
    # setupUi

    def retranslateUi(self, DialogNewInstance):
        DialogNewInstance.setWindowTitle(QCoreApplication.translate("DialogNewInstance", u"New Instance", None))
        self.label.setText(QCoreApplication.translate("DialogNewInstance", u"Name", None))
        self.label_2.setText(QCoreApplication.translate("DialogNewInstance", u"Group", None))
    # retranslateUi

