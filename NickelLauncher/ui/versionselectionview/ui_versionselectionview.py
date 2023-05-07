# -*- coding: utf-8 -*-

################################################################################
## Form generated from reading UI file 'versionselectionview.ui'
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
from PySide6.QtWidgets import (QApplication, QCheckBox, QHBoxLayout, QHeaderView,
    QLabel, QLayout, QPushButton, QSizePolicy,
    QSpacerItem, QTreeWidget, QTreeWidgetItem, QVBoxLayout,
    QWidget)

class Ui_VersionSelectionView(object):
    def setupUi(self, VersionSelectionView):
        if not VersionSelectionView.objectName():
            VersionSelectionView.setObjectName(u"VersionSelectionView")
        VersionSelectionView.resize(627, 302)
        self.horizontalLayout = QHBoxLayout(VersionSelectionView)
        self.horizontalLayout.setObjectName(u"horizontalLayout")
        self.horizontalLayout.setContentsMargins(0, 0, 0, 0)
        self.tree_version_list = QTreeWidget(VersionSelectionView)
        self.tree_version_list.setObjectName(u"tree_version_list")
        self.tree_version_list.setMinimumSize(QSize(300, 0))
        self.tree_version_list.setAlternatingRowColors(True)
        self.tree_version_list.setIndentation(0)
        self.tree_version_list.header().setStretchLastSection(False)

        self.horizontalLayout.addWidget(self.tree_version_list)

        self.layout_filter = QVBoxLayout()
        self.layout_filter.setObjectName(u"layout_filter")
        self.layout_filter.setSizeConstraint(QLayout.SetFixedSize)
        self.label_3 = QLabel(VersionSelectionView)
        self.label_3.setObjectName(u"label_3")
        self.label_3.setEnabled(True)
        self.label_3.setMinimumSize(QSize(93, 16))
        self.label_3.setAlignment(Qt.AlignCenter)

        self.layout_filter.addWidget(self.label_3)

        self.checkbox_release = QCheckBox(VersionSelectionView)
        self.checkbox_release.setObjectName(u"checkbox_release")
        self.checkbox_release.setMinimumSize(QSize(93, 20))
        self.checkbox_release.setFocusPolicy(Qt.ClickFocus)
        self.checkbox_release.setChecked(True)

        self.layout_filter.addWidget(self.checkbox_release)

        self.checkbox_beta = QCheckBox(VersionSelectionView)
        self.checkbox_beta.setObjectName(u"checkbox_beta")
        self.checkbox_beta.setMinimumSize(QSize(93, 20))
        self.checkbox_beta.setFocusPolicy(Qt.ClickFocus)

        self.layout_filter.addWidget(self.checkbox_beta)

        self.checkbox_preview = QCheckBox(VersionSelectionView)
        self.checkbox_preview.setObjectName(u"checkbox_preview")
        self.checkbox_preview.setMinimumSize(QSize(93, 20))
        self.checkbox_preview.setFocusPolicy(Qt.ClickFocus)

        self.layout_filter.addWidget(self.checkbox_preview)

        self.verticalSpacer = QSpacerItem(20, 40, QSizePolicy.Minimum, QSizePolicy.Expanding)

        self.layout_filter.addItem(self.verticalSpacer)

        self.button_refresh = QPushButton(VersionSelectionView)
        self.button_refresh.setObjectName(u"button_refresh")
        self.button_refresh.setMinimumSize(QSize(93, 28))
        self.button_refresh.setFocusPolicy(Qt.NoFocus)

        self.layout_filter.addWidget(self.button_refresh)


        self.horizontalLayout.addLayout(self.layout_filter)


        self.retranslateUi(VersionSelectionView)

        QMetaObject.connectSlotsByName(VersionSelectionView)
    # setupUi

    def retranslateUi(self, VersionSelectionView):
        VersionSelectionView.setWindowTitle(QCoreApplication.translate("VersionSelectionView", u"Form", None))
        ___qtreewidgetitem = self.tree_version_list.headerItem()
        ___qtreewidgetitem.setText(3, QCoreApplication.translate("VersionSelectionView", u"x86", None));
        ___qtreewidgetitem.setText(2, QCoreApplication.translate("VersionSelectionView", u"x64", None));
        ___qtreewidgetitem.setText(1, QCoreApplication.translate("VersionSelectionView", u"Type", None));
        ___qtreewidgetitem.setText(0, QCoreApplication.translate("VersionSelectionView", u"Version", None));
        self.label_3.setText(QCoreApplication.translate("VersionSelectionView", u"Filter", None))
        self.checkbox_release.setText(QCoreApplication.translate("VersionSelectionView", u"Releases", None))
        self.checkbox_beta.setText(QCoreApplication.translate("VersionSelectionView", u"Betas", None))
        self.checkbox_preview.setText(QCoreApplication.translate("VersionSelectionView", u"Previews", None))
        self.button_refresh.setText(QCoreApplication.translate("VersionSelectionView", u"Refresh", None))
    # retranslateUi

