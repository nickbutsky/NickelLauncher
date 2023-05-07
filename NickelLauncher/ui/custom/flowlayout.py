#############################################################################
#
# This file taken from
# https://code.qt.io/cgit/qt/qtbase.git/tree/examples/widgets/layouts/flowlayout/flowlayout.cpp?h=5.13
# Modified/adapted by jon, 10/07/2019, to translate into Python
#
# Copyright (C) 2016 The Qt Company Ltd.
# Contact: https://www.qt.io/licensing/
#
# This file is part of the examples of the Qt Toolkit.
#
# $QT_BEGIN_LICENSE:BSD$
# Commercial License Usage
# Licensees holding valid commercial Qt licenses may use this file in
# accordance with the commercial license agreement provided with the
# Software or, alternatively, in accordance with the terms contained in
# a written agreement between you and The Qt Company. For licensing terms
# and conditions see https://www.qt.io/terms-conditions. For further
# information use the contact form at https://www.qt.io/contact-us.
#
# BSD License Usage
# Alternatively, you may use this file under the terms of the BSD license
# as follows:
#
# "Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are
# met:
#   * Redistributions of source code must retain the above copyright
#     notice, this list of conditions and the following disclaimer.
#   * Redistributions in binary form must reproduce the above copyright
#     notice, this list of conditions and the following disclaimer in
#     the documentation and/or other materials provided with the
#     distribution.
#   * Neither the name of The Qt Company Ltd nor the names of its
#     contributors may be used to endorse or promote products derived
#     from this software without specific prior written permission.
#
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
# "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
# LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
# A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
# OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
# SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
# LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
# DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
# THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
# OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE."
#
# $QT_END_LICENSE$
#
#############################################################################


from PySide6.QtWidgets import QWidget, QLayout, QLayoutItem, QStyle, QSizePolicy
from PySide6.QtCore import Qt, QPoint, QRect, QSize


class FlowLayout(QLayout):
    def __init__(
            self,
            parent: QWidget | None = None,
            margin: int = -1,
            horizontal_spacing: int = -1,
            vertical_spacing: int = -1
    ):
        super().__init__(parent)
        self.setContentsMargins(margin, margin, margin, margin)

        self._horizontal_spacing = horizontal_spacing
        self._vertical_spacing = vertical_spacing

        self._items: list[QLayoutItem] = []

    def addItem(self, item: QLayoutItem):
        self._items.append(item)

    def count(self) -> int:
        return len(self._items)

    def itemAt(self, index: int) -> QLayoutItem | None:
        if 0 <= index < len(self._items):
            return self._items[index]
        else:
            return None

    def takeAt(self, index: int) -> QLayoutItem | None:
        if 0 <= index < len(self._items):
            return self._items.pop(index)
        else:
            return None

    def expandingDirections(self) -> Qt.Orientations:
        return Qt.Orientations(Qt.Orientation(0))

    def hasHeightForWidth(self) -> bool:
        return True

    def heightForWidth(self, width: int) -> int:
        height = self._do_layout(QRect(0, 0, width, 0), True)
        return height

    def setGeometry(self, rect: QRect):
        super().setGeometry(rect)
        self._do_layout(rect, False)

    def sizeHint(self) -> QSize:
        return self.minimumSize()

    def minimumSize(self) -> QSize:
        size = QSize()
        for item in self._items:
            size = size.expandedTo(item.minimumSize())

        margins = self.contentsMargins()
        size += QSize(margins.left() + margins.right(), margins.top() + margins.bottom())
        return size

    def _get_smart_spacing(self, pixel_metric: QStyle.PixelMetric) -> int:
        parent = self.parent()
        if not parent:
            return -1
        elif parent.isWidgetType():
            return parent.style().pixelMetric(pixel_metric, None, parent)
        else:
            return parent.spacing()

    def _do_layout(self, rect: QRect, test_only: bool) -> int:
        left, top, right, bottom = self.getContentsMargins()
        effective_rect = rect.adjusted(+left, +top, -right, -bottom)
        x = effective_rect.x()
        y = effective_rect.y()
        line_height = 0

        for item in self._items:
            widget = item.widget()

            if self._horizontal_spacing >= 0:
                x_spacing = self._horizontal_spacing
            else:
                x_spacing = self._get_smart_spacing(QStyle.PixelMetric.PM_LayoutHorizontalSpacing)
            if x_spacing == -1:
                x_spacing = widget.style().layoutSpacing(
                    QSizePolicy.ControlType.PushButton, QSizePolicy.ControlType.PushButton, Qt.Orientation.Horizontal
                )

            if self._vertical_spacing >= 0:
                y_spacing = self._vertical_spacing
            else:
                y_spacing = self._get_smart_spacing(QStyle.PixelMetric.PM_LayoutVerticalSpacing)
            if y_spacing == -1:
                y_spacing = widget.style().layoutSpacing(
                    QSizePolicy.ControlType.PushButton, QSizePolicy.ControlType.PushButton, Qt.Orientation.Vertical
                )

            next_x = x + item.sizeHint().width() + x_spacing
            if next_x - x_spacing > effective_rect.right() and line_height > 0:
                x = effective_rect.x()
                y = y + line_height + y_spacing
                next_x = x + item.sizeHint().width() + x_spacing
                line_height = 0

            if not test_only:
                item.setGeometry(QRect(QPoint(x, y), item.sizeHint()))

            x = next_x
            line_height = max(line_height, item.sizeHint().height())

        return y + line_height - rect.y() + bottom

    def __del__(self):
        item = self.takeAt(0)
        while item:
            item = self.takeAt(0)
