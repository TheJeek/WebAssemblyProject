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

            TextField {
                id: kInput
                width: 100
                text: "10"
                placeholderText: "Enter k"
            }

            Button {
                text: "Run Single Test"
                onClicked: {
                    resultsModel.clear()
                    mobopt.singleTest(Number(kInput.text))
                }
            }

            Button {
                text: "Run Incremental Test"
                onClicked: {
                    resultsModel.clear()
                    mobopt.incrementalTest(Number(kInput.text))
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
                            Text { text: "k: " + model.k; font.bold: true }
                            Text { text: "Result: " + model.result }
                            Text { text: "Max Recursion Depth: " + model.depth }
                            Text { text: "Stack Before Test: " + model.stackBefore + " bytes" }
                            Text { text: "Stack After Test: " + model.stackAfter + " bytes" }
                            Text { text: "Stack Average Usage with Depth " + model.depth + ": " + model.stackAverage + " bytes" }
                            Text { text: "Execution Time: " + model.executionTime + " ms" }
                            Text { text: "Deployment: " + model.deployment }
                        }
                    }
                }
            }
        }
    }

    // CONNECTIONS
    Connections {
        target: mob
        function onTestResult(k, result, maxDepth, stackBefore, stackAfter, stackAverage, executionTime, deployment) {
            resultsModel.append({
                k: k,
                result: result,
                depth: maxDepth,
                stackBefore: stackBefore,
                stackAfter: stackAfter,
                stackAverage: stackAverage,
                executionTime: executionTime ? executionTime : "0",
                deployment: deployment ? deployment : "N/A"
            })
        }
    }

    Connections {
        target: mobopt
        function onTestResult(k, result, maxDepth, stackBefore, stackAfter, stackAverage, executionTime, deployment) {
            resultsModel.append({
                k: k,
                result: result,
                depth: maxDepth,
                stackBefore: stackBefore,
                stackAfter: stackAfter,
                stackAverage: stackAverage,
                executionTime: executionTime ? executionTime : "0",
                deployment: deployment ? deployment : "N/A"
            })
        }
    }
}

