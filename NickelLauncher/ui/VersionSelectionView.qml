import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

RowLayout {
    Rectangle {
        id: filler1
        implicitWidth: (parent.width - checkbox.width) / 2 - parent.spacing
        Layout.fillHeight: true
        color: "red"
    }

    RowLayout {
        id: checkbox

        CheckBox {text: qsTr("Release")}
        CheckBox {text: qsTr("Beta")}
        CheckBox {text: qsTr("Preview")}
    }

    Rectangle {
        id: filler2
        Layout.fillWidth: true
        Layout.fillHeight: true
        color: "blue"
    }

    Button {
        id: refreshButton
        text: qsTr("⟳")
        implicitWidth: checkbox.height
        implicitHeight: checkbox.height
    }

    onWidthChanged: console.log("Left filler ", filler1.width, "Right filler", filler2.width, "Button ", refreshButton.width, "Right Side ", filler2.width + spacing + refreshButton.width)
}


