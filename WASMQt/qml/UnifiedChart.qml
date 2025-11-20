import QtQuick
import QtCharts

ChartView {
    id: chart
    anchors.fill: parent
    antialiasing: true
    title: chartType + " Chart"

    property var data: []
    property string chartType: "Line" // Line, Bar, or Scatter

    ValueAxis { id: axisX; titleText: "n" }
    ValueAxis { id: axisY; titleText: "Value" }

    onDataChanged: rebuildChart()

    function rebuildChart() {
        chart.removeAllSeries()

        if (!data || data.length === 0)
            return

        if (chartType === "Line") {
            let series = Qt.createQmlObject('import QtCharts; LineSeries {}', chart)
            series.axisX = axisX
            series.axisY = axisY
            for (let d of data)
                series.append(Number(d.index), Number(d.value))
            chart.addSeries(series)
            chart.createDefaultAxes()
        } else if (chartType === "Bar") {
            let barSeries = Qt.createQmlObject('import QtCharts; BarSeries {}', chart)
            let barSet = Qt.createQmlObject('import QtCharts; BarSet { label: "Duration" }', barSeries)
            let categories = []
            for (let d of data) {
                barSet.append(Number(d.duration))
                categories.push(String(d.index))
            }
            barSeries.append(barSet)
            chart.addSeries(barSeries)
            let catAxis = Qt.createQmlObject('import QtCharts; BarCategoryAxis {}', chart)
            catAxis.categories = categories
            chart.setAxisX(catAxis, barSeries)
        } else if (chartType === "Scatter") {
            let scatter = Qt.createQmlObject('import QtCharts; ScatterSeries {}', chart)
            for (let d of data)
                scatter.append(Number(d.index), Number(d.duration))
            chart.addSeries(scatter)
            chart.createDefaultAxes()
        }
    }
}
