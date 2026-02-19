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

            Column {
                spacing: 2
                Label { text: "Input for k" }
                TextField {
                    id: kInput
                    width: 100
                    text: "10"
                    placeholderText: "Enter k"
                    inputMethodHints: Qt.ImhDigitsOnly
                }
            }

            Column {
                spacing: 2
                Label { text: "Repetitions:" }
                TextField {
                    id: runsInput
                    width: 80
                    placeholderText: "Runs"
                    inputMethodHints: Qt.ImhDigitsOnly
                    text: "1"
                }
            }

            Button {
                text: "Run Single Test"
                height: 40
                onClicked: {
                    resultsModel.clear()
                    algorithm.singleTest(Number(kInput.text), Number(runsInput.text))
                }
            }

            Button {
                text: "Run Incremental Test"
                height: 40
                onClicked: {
                    resultsModel.clear()
                    algorithm.incrementalTest(Number(kInput.text), Number(runsInput.text))
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
                    text: "• Configured Stack Size for Native and WebAssembly: 8MB"
                    wrapMode: Text.Wrap
                }

                Label {
                    text: "• Recommended k in Native is up to 15"
                    wrapMode: Text.Wrap
                }

                Label {
                    text: "• Recommended k in WebAssembly is up to 13"
                    wrapMode: Text.Wrap
                }

                Label {
                    text: "• Choosing higher k in Native build will result in stack overflow and crash the application."
                    wrapMode: Text.Wrap
                }

                Label {
                    text: "• Choosing higher k in WebAssembly build will result in Browser error: 'Uncaught InternalError: too much recursion'"
                    wrapMode: Text.Wrap
                }
        }
        }

        // SCROLLABLE RESULTS
        ScrollView {
            width: parent.width
            height: parent.height - 230
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
                            Text { text: "k: " + model.k; font.bold: true }
                            Text { text: "Result: " + model.result }
                            Text { text: "Max Recursion Depth: " + model.depth }
                            Text { text: "Call Count: " + model.callCount }
                            Text { text: "Stack Before Test: " + model.stackBefore + " bytes" }
                            Text { text: "Stack After Test: " + model.stackAfter + " bytes" }
                            Text { text: "Stack Average Usage with Depth " + model.depth + ": " + model.stackAverage + " bytes" }
                            Text { text: "Average Execution Time: " + model.executionTime + " ms" }
                            Text { text: "Deployment: " + model.deployment }
                        }
                    }
                }
            }
        }
    }

    Connections {
        target: algorithm
        function onTestResultMob(k, result, maxDepth, stackBefore, stackAfter, stackAverage, executionTime, deployment, callCount) {
            resultsModel.append({
                k: k,
                result: result,
                depth: maxDepth,
                stackBefore: stackBefore,
                stackAfter: stackAfter,
                stackAverage: stackAverage,
                executionTime: executionTime ? executionTime : "0",
                callCount: callCount,
                deployment: deployment ? deployment : "N/A"
            })
        }
    }
}

