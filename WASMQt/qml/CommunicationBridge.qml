import QtQuick
import QtQuick.Controls
import QtQuick.Layouts


Page {
    id: communicationPage
    title: "Communication Bridge"
    background: Rectangle {
            color: "#616060"
        }

    // State
    property string lastString: ""

    ListModel { id: logModel }

    function log(text) {
        logModel.append({
            timestamp: new Date().toTimeString(),
            message: text
        })
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: 12

        Label {
            text: "WebAssembly Communication Bridge"
            font.pixelSize: 22
            Layout.alignment: Qt.AlignHCenter
        }


        // EXPLANATION / NOTES
        GroupBox {
            title: "Notes"
            Layout.fillWidth: true

            ColumnLayout {
                spacing: 6

                Label {
                    text: "• If used in WebAssembly build, will only work correctly if deployed in the Web Frontend."
                    wrapMode: Text.Wrap
                }

                Label {
                    text: "• To send a Message from JS to Qt use the 'Send Message to Qt' window on the Web Frontend."
                    wrapMode: Text.Wrap
                }

                Label {
                    text: "• If used in Native build the output will simply appear in application output."
                    wrapMode: Text.Wrap
                }
        }
        }

        // RECEIVED VALUES
        GroupBox {
            title: "Last Messages From JS"
            Layout.fillWidth: true

            ColumnLayout {
                spacing: 6

                Label {
                    text: "Last String: " + (lastString || "-")
                }
            }
        }

        // SEND TO JS
        GroupBox {
            title: "Send Message to JS"
            Layout.fillWidth: true

            RowLayout {
                spacing: 8

                TextField {
                    id: messageInput
                    Layout.fillWidth: true
                    placeholderText: "Message to send"
                }

                Button {
                    text: "Send"
                    onClicked: {
                        if (messageInput.text.length > 0) {
                            cBridge.sendMessageToJS(messageInput.text)
                            log("Qt → JS: " + messageInput.text)
                            messageInput.clear()
                        }
                    }
                }
            }
        }

        // LOG
        GroupBox {
            title: "Event Log"
            Layout.fillWidth: true
            Layout.fillHeight: true

            ListView {
                anchors.fill: parent
                model: logModel
                clip: true

                delegate: Rectangle {
                    height: textItem.implicitHeight + 8
                    color: index % 2 === 0 ? "#f3f3f3" : "#ffffff"

                    Text {
                        id: textItem
                        anchors.left: parent.left
                        anchors.leftMargin: 8
                        anchors.verticalCenter: parent.verticalCenter
                        text: "[" + timestamp + "] " + message
                        wrapMode: Text.Wrap
                    }
                }
            }
        }

        Button {
            text: "Clear Log"
            Layout.alignment: Qt.AlignRight
            onClicked: {
                logModel.clear()
            }
        }
    }

    // CONNECTION TO C++
    Connections {
        target: cBridge

        function onStringReceived(value) {
            log("JS → Qt (String): " + value)
            lastString = value
        }
    }
}
