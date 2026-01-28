import QtQuick 2.15
import QtQuick.Controls 2.15

Page {
    visible: true
    background: Rectangle { color: "#616060" }

    property var chartData: []

    Column {
        anchors.fill: parent
        anchors.margins: 20
        spacing: 10

        // Controls at the top
        Row {
            id: controlsRow
            spacing: 10
            height: 30

            TextField {
                id: inputField
                placeholderText: "Enter n"
                width: 100
                inputMethodHints: Qt.ImhDigitsOnly
            }

            Button {
                text: "Compute"
                onClicked: {
                    // Compute Fibonacci durations via C++ algorithm
                    var rawSeries = algorithm.computeSeriesIterative(parseInt(inputField.text))

                    // Transform C++ QVariantMap to { x, y } for DynamicLineChart
                    var series = []
                    for (var i = 0; i < rawSeries.length; i++) {
                        const point = rawSeries[i]
                        series.push({
                            x: point.index,
                            y: point.duration / 1000  // convert ns -> µs
                        })
                    }

                    chartData = series
                    if (chartLoader.item) {
                        chartLoader.item.chartTitle = "Fibonacci"
                        chartLoader.item.xAxisTitle = "n"
                        chartLoader.item.yAxisTitle = "Duration (µs)"
                        chartLoader.item.data = chartData
                        chartLoader.item.rebuildChart()   // redraw once
                    }
                }
            }

            ComboBox {
                id: chartSelector
                model: ["Line", "Bar"]
            }
        }

        // Chart fills remaining space
        Loader {
            id: chartLoader
            anchors.top: controlsRow.bottom
            anchors.left: parent.left
            anchors.right: parent.right
            anchors.bottom: parent.bottom
            anchors.topMargin: 10
            source: chartSelector.currentText === "Bar"
                ? "qrc:/qml/DynamicBarChart.qml"
                : "qrc:/qml/DynamicLineChart.qml"

            onLoaded: {
                // Make loaded chart fill the loader
                if (item) {
                    item.anchors.fill = chartLoader
                }
            }
        }
    }
}
