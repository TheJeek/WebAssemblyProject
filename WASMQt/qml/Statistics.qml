import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Page {
    id: statisticsPage
    title: "Statistics"
    property var statisticsBridge

    background: Rectangle {
        color: "#616060"
    }

    // Values coming from C++ later
    property int sizeInt: 0
    property int sizeLong: 0
    property int sizeBool: 0
    property int sizeVoidPtr: 0
    property int sizeSharedPtr: 0
    property int sizeUniquePtr: 0           
    property int sizeChar: 0
    property int sizeShort: 0
    property int sizeLongLong: 0
    property int sizeFloat: 0
    property int sizeDouble: 0
    property int sizeLongDouble: 0
    property int sizeIntPtr: 0
    property int sizeVector: 0
    property int sizeString: 0
    property int sizeArray: 0
    property int sizePair: 0
    property int sizeUIntPtr: 0
    property int sizeSizeT: 0
    property int sizeStruct: 0

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 12

        // HEADER
        Label {
            text: "Wasm vs Native Type Sizes"
            font.pixelSize: 22
            Layout.alignment: Qt.AlignHCenter
        }

        Label {
            text: "Values are reported from C++ at runtime"
            color: "#bbbbbb"
            Layout.alignment: Qt.AlignHCenter
        }

        // TYPE SIZE TABLE
        GroupBox {
            title: "C++ Type Sizes (bytes)"
            Layout.fillWidth: true

            ColumnLayout {
                anchors.fill: parent
                spacing: 0

                // Header row
                RowLayout {
                    Layout.fillWidth: true
                    spacing: 24
                    Label { text: "Type"; font.bold: true }
                    Label { text: "Size"; font.bold: true }
                }

                // Divider under header
                Rectangle {
                    color: "#555555"
                    height: 1
                    Layout.fillWidth: true
                }

                Repeater {
                    model: [
                        { type: "char", size: sizeChar },
                        { type: "short", size: sizeShort },
                        { type: "int", size: sizeInt },
                        { type: "long", size: sizeLong },
                        { type: "long long", size: sizeLongLong },
                        { type: "bool", size: sizeBool },
                        { type: "float", size: sizeFloat },
                        { type: "double", size: sizeDouble },
                        { type: "long double", size: sizeLongDouble },
                        { type: "std::array<T,N>", size: sizeArray },
                        { type: "std::pair<T1,T2>", size: sizePair },
                        { type: "Struct", size: sizeStruct },
                        { type: "void*", size: sizeVoidPtr },
                        { type: "int*", size: sizeIntPtr },
                        { type: "std::shared_ptr<T>", size: sizeSharedPtr },
                        { type: "std::unique_ptr<T>", size: sizeUniquePtr },
                        { type: "std::vector<T>", size: sizeVector },
                        { type: "std::string", size: sizeString },
                        { type: "uintptr_t", size: sizeUIntPtr },
                        { type: "size_t", size: sizeSizeT }
                    ]

                    delegate: ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 0

                        RowLayout {
                            Layout.fillWidth: true
                            spacing: 24
                            Label { text: modelData.type; Layout.preferredWidth: 200 }
                            Label { text: modelData.size > 0 ? modelData.size + " bytes" : "-" }
                        }

                        // Divider line between rows
                        Rectangle {
                            color: "#555555"
                            height: 1
                            Layout.fillWidth: true
                        }
                    }
                }
            }
        }

        // EXPLANATION / NOTES
        GroupBox {
            title: "Notes"
            Layout.fillWidth: true

            ColumnLayout {
                spacing: 6

                Label {
                    text: "• Pointer-based types differ between Native and WebAssembly"
                    wrapMode: Text.Wrap
                }

                Label {
                    text: "• wasm32 uses 32-bit pointers, native platforms usually use 64-bit"
                    wrapMode: Text.Wrap
                }
        }
        }
        Item { Layout.fillHeight: true }

        Button {
            text: "Refresh from C++"
            Layout.alignment: Qt.AlignRight
            onClicked: {
                algorithm.requestStatistics();
            }
        }

    }

    Connections {
        target: algorithm
        function onStatisticsReceived(sizeInt, sizeLong, sizeBool, sizeVoidPtr, sizeSharedPtr, sizeUniquePtr, sizeChar, sizeShort, sizeLongLong, sizeFloat,
                                      sizeDouble, sizeLongDouble, sizeIntPtr, sizeVector, sizeString, sizeArray, sizePair, sizeUIntPtr, sizeSizeT, sizeStruct) {
            statisticsPage.sizeInt = sizeInt
            statisticsPage.sizeLong = sizeLong
            statisticsPage.sizeBool = sizeBool
            statisticsPage.sizeVoidPtr = sizeVoidPtr
            statisticsPage.sizeSharedPtr = sizeSharedPtr
            statisticsPage.sizeUniquePtr = sizeUniquePtr
            statisticsPage.sizeChar = sizeChar
            statisticsPage.sizeShort = sizeShort
            statisticsPage.sizeLongLong = sizeLongLong
            statisticsPage.sizeFloat = sizeFloat
            statisticsPage.sizeDouble = sizeDouble
            statisticsPage.sizeLongDouble = sizeLongDouble
            statisticsPage.sizeIntPtr = sizeIntPtr
            statisticsPage.sizeVector = sizeVector
            statisticsPage.sizeString = sizeString
            statisticsPage.sizeArray = sizeArray
            statisticsPage.sizePair = sizePair
            statisticsPage.sizeUIntPtr = sizeUIntPtr
            statisticsPage.sizeSizeT = sizeSizeT
            statisticsPage.sizeStruct = sizeStruct
        }
    }
}

