import QtQuick 2.15
import QtQuick.Controls 2.15

Page {
    width: 1600
    height: 1200
    visible: true
    background: Rectangle {
            color: "#2b2b2b"
        }

    property var chartData: []

    onChartDataChanged: {
        if (chartLoader.item) {
            Qt.callLater(function() {
                chartLoader.item.data = chartData
            })
        }
    }

    Row {
        anchors.centerIn: parent
        spacing: 20


        // Left: Chart controls
        Column {
            spacing: 12

            Button {
                text: "Log Data"
                onClicked: {
                    for (var i = 0; i < chartModel.count; ++i) {
                        var d = chartModel.get(i)
                        console.log(`n=${d.index} fib=${d.value} dur=${d.duration/1000}`)
                    }
                }
            }

            Row {
                spacing: 10
                TextField {
                    id: inputField
                    placeholderText: "Enter n"
                    width: 100
                    inputMethodHints: Qt.ImhDigitsOnly
                }
                Button {
                    text: "Compute"
                    onClicked: {
                        var series = fibonacci.computeSeries(parseInt(inputField.text))
                        Qt.callLater(function() {
                            chartData = series
                            if (chartLoader.item)
                                chartLoader.item.data = chartData
                        })
                    }
                }
                ComboBox {
                    id: chartSelector
                    model: ["Bar", "Line"]
                }
            }

            Loader {
                id: chartLoader
                anchors.horizontalCenter: parent.horizontalCenter
                width: 700
                height: 500
                source: chartSelector.currentText === "Bar"
                    ? "qrc:/qml/DynamicBarChart.qml"
                    : "qrc:/qml/DynamicLineChart.qml"

                onLoaded: Qt.callLater(function() {
                    item.data = chartModel
                })
            }
        }
    }
}
