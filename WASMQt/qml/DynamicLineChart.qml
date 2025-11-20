// qml/DynamicLineChart.qml
import QtQuick
import QtCharts

ChartView {
    id: chart
    title: "Fibonacci Values (Line Chart)"
    anchors.fill: parent
    antialiasing: true

    property var data: []

    ValueAxis { id: axisX; titleText: "n"; min: 0; labelFormat: "%d"}
    ValueAxis { id: axisY; titleText: "Duration (ms)"; min: 0; labelFormat: "%d"}

    LineSeries {
        id: series
        name: "Fib(n)"
        axisX: axisX
        axisY: axisY
    }

    Component.onCompleted: rebuildChart()
    onDataChanged: rebuildChart()

    function rebuildChart() {
        series.clear()
        for (let d of data) {
            series.append(d.index, d.duration/1000000)
        }
        axisX.max = data.length > 0 ? data[data.length - 1].index : 0
        axisY.max = Math.max.apply(Math, data.map(d => d.duration/1000000))
    }
}
