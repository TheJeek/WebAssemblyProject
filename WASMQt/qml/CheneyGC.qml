import QtQuick 2.15
import QtQuick.Controls 2.15
import QtCharts 2.15
import QtQuick.Layouts

Page  {
    visible: true
    width: 1000
    height: 700
    background: Rectangle {
            color: "#616060"
        }

    ListModel {
        id: resultsModel
    }

    Column {
        anchors.fill: parent
        spacing: 10
        padding: 10

        // INPUT ROW
        Row {
            spacing: 10
            width: parent.width

            // Runs Input
            Column {
                spacing: 2
                Label { text: "Repetitions:" }
                TextField {
                    id: inputFieldIterationNumber
                    width: 80
                    inputMethodHints: Qt.ImhDigitsOnly
                    text: "1"
                }
            }

            Button {
                height: 40
                text: "Run Cheney Garbage Collection Simulation"
                onClicked: {
                    resultsModel.clear()
                    algorithm.benchmarkCheneyCG(Number(inputFieldIterationNumber.text))
                }
            }
        }

        // EXPLANATION / NOTES
        GroupBox {
            title: "Notes"
            Layout.fillWidth: true

            ColumnLayout {
                spacing: 6

                Label {
                    text: "• Semi Space Size is set at Compile Time (128MB/256MB/512MB/1GB/2GB)."
                    wrapMode: Text.Wrap
                }

                Label {
                    text: "• WebAssembly 32-bit model would support 4GB total but current Browser restrictions only allow for 2GB\n => There are 2 Semi-Spaces so maximum allowed Semi-Space Size for WebAssembly: 1GB"
                    wrapMode: Text.Wrap
                }

                Label {
                    text: "• Cheney's Algorithm is modified to use inefficient byte-wise swap between Semi-Spaces instead of pointer manipulation\n => To better visualize memory growth and stress memory operations"
                    wrapMode: Text.Wrap
                }

                Label {
                    text: "• Native Limit depends on availably system memory"
                    wrapMode: Text.Wrap
                }
        }
        }

        // SCROLLABLE RESULTS
        ScrollView {
            width: parent.width
            height: parent.height - 20
            clip: true

            Column {
                id: resultsColumn
                width: parent.width
                spacing: 10

                Repeater {
                    model: resultsModel

                    Rectangle {
                        width: parent.width
                        color: index % 2 === 0 ? "#ffffff" : "#e0e0e0"
                        radius: 5
                        border.color: "#cccccc"
                        anchors.horizontalCenter: parent.horizontalCenter
                        implicitHeight: contentColumn.implicitHeight + 10

                        Column {
                            id: contentColumn
                            anchors.fill: parent
                            anchors.margins: 5
                            spacing: 2
                            Text { text: "Semi-Space Size: " + model.semiSize; font.bold: true }
                            Text { text: "Total Heap Size Increase: " + model.heapSize }
                            Text { text: "Iterations: " + model.iterNum }
                            Text { text: "Average Execution Time: " + model.executionTime }
                            Text { text: "Deloyment: " + model.deployment }
                        }
                    }
                }
            }
        }
    }

    Connections {
        target: algorithm
        function onTestResultCheneyGC(semiSize, heapSize, iterNum, executionTime, deployment) {
            resultsModel.append({
                semiSize: semiSize,
                heapSize: heapSize,
                iterNum: iterNum,
                executionTime: executionTime,
                deployment: deployment,
            })
        }
    }
}
