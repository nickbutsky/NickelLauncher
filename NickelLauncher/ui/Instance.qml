import QtQuick
import QtQuick.Controls
import QtQuick.Layouts


ToolButton {
    width: 50
    height: 50
    checkable: true

    ColumnLayout {
        anchors.fill: parent

        Image {
            source: "qrc:/default.png"
            Layout.alignment: Qt.AlignHCenter
        }

        Text {
            text: "filler"
            Layout.alignment: Qt.AlignHCenter
        }
    }

    Menu {
        id: menu

        MenuItem { text: qsTr("Launch") }
        MenuSeparator {}
        MenuItem { text: qsTr("Rename") }
        MenuItem { text: qsTr("Change Group") }
        MenuItem { text: qsTr("Change Version") }
        MenuSeparator {}
        MenuItem { text: qsTr("Mineraft Folder") }
        MenuItem { text: qsTr("Instance Folder") }
        MenuSeparator {}
        MenuItem { text: qsTr("Copy Instance") }
    }

    MouseArea {
        anchors.fill: parent
        acceptedButtons: Qt.RightButton
        onClicked: {
            parent.checked = true;
            menu.popup();
        }
    }
}
