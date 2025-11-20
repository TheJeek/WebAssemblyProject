import QtQuick
import QtCharts

ChartView {
    id: chart
    anchors.fill: parent
    antialiasing: true
    title: "Fibonacci Duration (Bar Chart)"
    legend.alignment: Qt.AlignBottom

    property var data: []

    Component.onCompleted: rebuildChart()
    onDataChanged: rebuildChart()


    BarSeries {
        id: series
        axisX: BarCategoryAxis { id: axisX }
        axisY: ValueAxis { id: axisY; titleText: "Duration (ms)"; min: 0; labelFormat: "%d"}

        BarSet { id: barSet; label: "Duration (μs)" }
    }

    function rebuildChart() {
        // Remove all old values by creating a new array
        let values = []
        let categories = []

        for (let d of data) {
            let val = Number(d.duration)
            let idx = d.index
            values.push(val)
            categories.push(String(idx))
        }

        while (barSet.count > 0)
            barSet.remove(0)   // remove all previous entries

        for (let v of values)
            barSet.append(v)

        axisX.categories = categories
        axisX.max = data.length > 0 ? data[data.length - 1].index : 0
        axisY.max = Math.max.apply(Math, data.map(d => d.duration))
    }

}
