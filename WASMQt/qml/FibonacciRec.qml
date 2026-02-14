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
                // Duration (ms)
                yValue = point.duration
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
        spacing: 20

        // Controls
        Row {
            id: controlsRow
            spacing: 20
            height: 40

            // From Input
            Column {
                spacing: 2
                Label { text: "From:" }
                TextField {
                    id: inputFieldFrom
                    width: 80
                    placeholderText: "Start"
                    inputMethodHints: Qt.ImhDigitsOnly
                    text: "0"
                }
            }

            // To Input
            Column {
                spacing: 2
                Label { text: "To:" }
                TextField {
                    id: inputFieldTo
                    width: 80
                    placeholderText: "End"
                    inputMethodHints: Qt.ImhDigitsOnly
                }
            }

            // Runs Input
            Column {
                spacing: 2
                Label { text: "Repetitions:" }
                TextField {
                    id: runsField
                    width: 80
                    placeholderText: "Runs"
                    inputMethodHints: Qt.ImhDigitsOnly
                    text: "1"
                }
            }

            // Compute Button
            Button {
                text: "Compute"
                width: 100
                height: 40
                onClicked: {
                    rawData = algorithm.computeSeriesRecursive(
                        parseInt(inputFieldFrom.text),
                        parseInt(inputFieldTo.text),
                        parseInt(runsField.text)
                    )

                    hasData = true

                    if (chartLoader.item) {
                        chartLoader.item.chartTitle = "Recursive Fibonacci"
                        chartLoader.item.xAxisTitle = "n"
                    }

                    rebuildSeries()
                }
            }

            // Metric Selector
            Column {
                spacing: 2
                Label { text: "Metric:" }
                ComboBox {
                    id: metricSelector
                    model: ["Call Count", "Duration"]

                    onCurrentTextChanged: rebuildSeries()
                }
            }
        }

        // Chart (Currently set to only Line Chart)
        Loader {
            id: chartLoader
            anchors.top: controlsRow.bottom
            anchors.left: parent.left
            anchors.right: parent.right
            anchors.bottom: parent.bottom
            anchors.topMargin: 10

            source: "qrc:/qml/DynamicLineChart.qml"

            onLoaded: {
                if (item) {
                    item.anchors.fill = chartLoader
                    item.data = chartData
                }
            }
        }
    }
}
