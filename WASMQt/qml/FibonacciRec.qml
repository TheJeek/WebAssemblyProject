import QtQuick 2.15
import QtQuick.Controls 2.15

Page {
    id: page
    visible: true

    background: Rectangle {
        color: "#616060"
    }

    // Raw data from C++ (saved to switch between duration and callCount)
    property var rawData: []

    // Data actually fed to the chart
    property var chartData: []

    property bool hasData: false

    function rebuildSeries() {
        if (!rawData || rawData.length === 0){
            return
        }

        var series = []

        for (var i = 0; i < rawData.length; i++) {
            const point = rawData[i]
            var yValue

            if (metricSelector.currentText === "Call Count") {
                yValue = point.callCount
            } else {
                // Duration (ns → ms)
                yValue = point.duration / 1000000
            }

            series.push({
                x: point.index,
                y: yValue
            })
        }

        chartData = series

        if (chartLoader.item) {
            chartLoader.item.data = chartData
            chartLoader.item.yAxisTitle =
                metricSelector.currentText === "Call Count"
                    ? "Function Calls"
                    : "Duration (ms)"
            chartLoader.item.rebuildChart()
        }
    }

    Column {
        anchors.fill: parent
        anchors.margins: 20
        spacing: 10

        // Controls
        Row {
            id: controlsRow
            spacing: 10
            height: 30

            TextField {
                id: inputField
                width: 100
                placeholderText: "Enter n"
                inputMethodHints: Qt.ImhDigitsOnly
            }

            Button {
                text: "Compute"
                onClicked: {
                    rawData = algorithm.computeSeriesRecursive(
                                parseInt(inputField.text))

                    hasData = true

                    if (chartLoader.item) {
                        chartLoader.item.chartTitle = "Recursive Fibonacci"
                        chartLoader.item.xAxisTitle = "n"
                    }

                    rebuildSeries()
                }
            }

            ComboBox {
                id: metricSelector
                model: ["Call Count", "Duration"]

                onCurrentTextChanged: {
                    rebuildSeries()
                }
            }

            ComboBox {
                id: chartSelector
                model: ["Line", "Bar"]
            }
        }

        // Chart
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
                if (item) {
                    item.anchors.fill = chartLoader
                    item.data = chartData
                }
            }
        }
    }
}
