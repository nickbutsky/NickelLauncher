import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

ColumnLayout {
    Item {
        Layout.fillWidth: true
        Layout.preferredHeight: topLayout.implicitHeight

        RowLayout {
            id: topLayout
            anchors.fill: parent

            Item {implicitWidth: (parent.width - tabBar.width) / 2 - parent.spacing}

            TabBar {
                id: tabBar

                readonly property real __tabsWidth: Math.max(releaseTab.implicitWidth, betaTab.implicitWidth, previewTab.implicitWidth)

                TabButton {
                    id: releaseTab
                    text: qsTr("Release")
                    width: tabBar.__tabsWidth
                }
                TabButton {
                    id: betaTab
                    text: qsTr("Beta")
                    width: tabBar.__tabsWidth
                }
                TabButton {
                    id: previewTab
                    text: qsTr("Preview")
                    width: tabBar.__tabsWidth
                }
            }

            Item {Layout.fillWidth: true}

            Button {
                text: qsTr("⟳")
            }
        }
    }

    Item {
        Layout.fillWidth: true
        Layout.fillHeight: true

        StackLayout {
            anchors.fill: parent
            currentIndex: tabBar.currentIndex

            Repeater {
                readonly property list<ListModel> __subModels: [
                    ListModel {
                        ListElement {
                            name: "1.18.12"
                        }
                        ListElement {
                            name: "1.18.13"
                        }
                    },
                    ListModel {
                        ListElement {
                            name: "1.19"
                        }
                    },
                    ListModel {
                        ListElement {
                            name: "1.20"
                        }
                    }
                ]

                model: __subModels
                delegate: ListView {
                    id: lv
                    model: modelData
                    delegate: Item {
                        implicitWidth: parent.width
                        implicitHeight: delegateLayout.implicitHeight

                        RowLayout {
                            id: delegateLayout
                            anchors.fill: parent

                            Text {text: name}
                            Item {Layout.fillWidth: true}
                            Text {text: "x64 | x86"}
                        }

                        MouseArea {
                            anchors.fill: parent
                            onClicked: lv.currentIndex = index
                        }
                    }
                    highlight: Rectangle {color: "lightsteelblue"}
                }
            }
        }
    }
}
