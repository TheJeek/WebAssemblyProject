import QtQuick 2.15
import QtCharts 2.15

ChartView {
    id: chart
    anchors.fill: parent
    antialiasing: true
    animationOptions: ChartView.NoAnimation

    property string chartTitle: "Dynamic Chart"
    title: chartTitle

    property string xAxisTitle: "X Axis"
    property string yAxisTitle: "Y Axis"

    ValueAxis { id: axisX; titleText: xAxisTitle; min: 0 }
    ValueAxis { id: axisY; titleText: yAxisTitle; min: 0 }

    property var data: []     // array of {x,y}

    LineSeries {
        id: series
        name: "Index"
        axisX: axisX
        axisY: axisY
        color: "red"
        width: 2
    }

    function rebuildChart() {
        series.clear()
        if (data.length < 2) return

        let maxX = 0
        let maxY = 0

        for (let i = 0; i < data.length; i++) {
            const point = data[i]
            if (!isFinite(point.x) || !isFinite(point.y)) continue
            series.append(point.x, point.y)
            if (point.x > maxX) maxX = point.x
            if (point.y > maxY) maxY = point.y
        }

        axisX.min = 0
        axisX.max = maxX
        axisY.min = 0
        axisY.max = maxY * 1.05
    }
}

