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
            color: "#616060"

            ListView {
                id: navList
                anchors.fill: parent
                model: [
                    { name: "Communication", source: "CommunicationBridge.qml" },
                    { name: "Statistics", source: "Statistics.qml" },
                    { name: "ManOrBoy", source: "ManOrBoy.qml" },
                    { name: "Fibonacci Iterative", source: "FibonacciIter.qml" },
                    { name: "Fibonacci Recursive", source: "FibonacciRec.qml" },
                    { name: "Sieve of Eratosthenes", source: "SieveOfEratosthenes.qml" }
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
        }
    }
}

