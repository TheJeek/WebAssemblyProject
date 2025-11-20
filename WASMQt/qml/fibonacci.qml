import QtQuick
import QtQuick.Controls
import QtCharts

Rectangle {
    visible: true
    width: 800
    height: 600

    Column {
        anchors.centerIn: parent
        spacing: 20

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
                    chartData = fibonacci.computeSeries(parseInt(inputField.text))
                }
            }

            ComboBox {
                id: chartSelector
                model: ["Line", "Bar", "Scatter"]
            }
        }

        Loader {
            id: chartLoader
            sourceComponent: chartSelector.currentText === "Line" ? lineChart :
                             chartSelector.currentText === "Bar" ? barChart :
                             scatterChart
        }
    }

    property var chartData: []

    Component {
        id: lineChart
        ChartView {
            anchors.fill: parent
            title: "Fibonacci Values (Line Chart)"
            LineSeries {
                name: "Value"
                XYPoint { x: 0; y: 0 }
                Component.onCompleted: {
                    clear()
                    for (let d of chartData)
                        append(d.index, d.value)
                }
            }
        }
    }

    Component {
        id: barChart
        ChartView {
            anchors.fill: parent
            title: "Computation Duration (Bar Chart)"
            BarSeries {
                BarSet {
                    label: "Duration (ms)"
                    Component.onCompleted: {
                        clear()
                        for (let d of chartData)
                            append(d.duration)
                    }
                }
            }
        }
    }

    Component {
        id: scatterChart
        ChartView {
            anchors.fill: parent
            title: "Index vs Duration (Scatter)"
            ScatterSeries {
                Component.onCompleted: {
                    clear()
                    for (let d of chartData)
                        append(d.index, d.duration)
                }
            }
        }
    }
}
