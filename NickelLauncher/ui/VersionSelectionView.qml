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
                onClicked: _versionSelectionViewModel.refresh()
            }
        }
    }

    Item {
        Layout.fillWidth: true
        Layout.fillHeight: true

        StackLayout {
            anchors.fill: parent
            currentIndex: tabBar.currentIndex

            ListView {
                clip: true
                model: _versionSelectionViewModel.releaseViewModel
                delegate: delegateComponent
                highlight: highlightComponent
            }
            ListView {
                clip: true
                model: _versionSelectionViewModel.betaViewModel
                delegate: delegateComponent
                highlight: highlightComponent
            }
            ListView {
                clip: true
                model: _versionSelectionViewModel.previewViewModel
                delegate: delegateComponent
                highlight: highlightComponent
            }

            Component {
                id: delegateComponent

                Item {
                    readonly property ListView __lv: ListView.view

                    implicitWidth: parent.width
                    implicitHeight: delegateLayout.implicitHeight

                    RowLayout {
                        id: delegateLayout
                        anchors.fill: parent

                        Text {text: name}
                        Item {Layout.fillWidth: true}
                        Text {text: architectures}
                    }

                    MouseArea {
                        anchors.fill: parent
                        onClicked: __lv.currentIndex = index
                    }
                }
            }

            Component {
                id: highlightComponent

                Rectangle {color: "lightsteelblue"}
            }
        }
    }
}
