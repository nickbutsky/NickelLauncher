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

            VersionList {
                viewModel: _versionSelectionViewModel.releaseViewModel
            }
            VersionList {
                viewModel: _versionSelectionViewModel.betaViewModel
            }
            VersionList {
                viewModel: _versionSelectionViewModel.previewViewModel
            }

            component VersionList: ListView {
                required property var viewModel

                id: versionList
                clip: true
                model: viewModel
                delegate: Component {
                    Item {
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
                            onClicked: versionList.currentIndex = index
                        }
                    }
                }
                highlightFollowsCurrentItem: false
                highlight: Component {
                    Rectangle {
                        color: "lightsteelblue"
                        anchors.fill: versionList.currentItem
                        y: versionList.currentItem.y
                    }
                }

                Connections {
                    target: viewModel
                    onModelReset: versionList.currentIndex = 0
                }
            }
        }
    }
}
