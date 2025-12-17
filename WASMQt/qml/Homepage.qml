import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Page {
    id: homePage
    title: "Home"

    RowLayout {
        anchors.fill: parent
        spacing: 0

        // LEFT SIDE NAVIGATION
        Rectangle {
            Layout.preferredWidth: 200
            Layout.fillHeight: true
            color: "#2c2c2c"

            ListView {
                id: navList
                anchors.fill: parent
                model: [
                    { name: "ManOrBoy", source: "ManOrBoy.qml", color: "#2c2c2c" },
                    { name: "Chart",    source: "Fibonacci.qml" },
                    { name: "Communication", source: "CommunicationBridge.qml" }
                ]

                delegate: ItemDelegate {
                    width: parent.width
                    text: modelData.name
                    highlighted: ListView.isCurrentItem

                onClicked: {
                    navList.currentIndex = index
                    contentLoader.source = modelData.source }
                }
            }
        }

        // RIGHT SIDE CONTENT
        Loader {
            id: contentLoader
            Layout.fillWidth: true
            Layout.fillHeight: true
            source: "ManOrBoy.qml"   // default page

            onLoaded: {
                // Make sure the loaded item sees the bridge
                if (contentLoader.item) {
                    contentLoader.item.communicationBridge = communicationBridge
                }
            }
        }
    }
}

