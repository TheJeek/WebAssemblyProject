#include "communicationbridge.h"
#include <QString>
#include <QDebug>
#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif
#include <QTimer>

CommunicationBridge::CommunicationBridge(QObject* parent)
    : QObject(parent)
{
}

// Called from C++ internally or from wrapper
void CommunicationBridge::receiveMessageFromJS(const QString &msg) {
    qDebug() << "[Qt] Received String from JS:" << msg;
    emit stringReceived(msg);
}

void CommunicationBridge::receiveNumberFromJS(const int &number) {
    qDebug() << "[Qt] Received from JS:" << number;
    emit numberReceived(number);
}

// Sends a QString from Qt to JS
void CommunicationBridge::sendMessageToJS(const QString &msg) {
    QByteArray utf8 = msg.toUtf8(); // convert QString to UTF-8
#ifdef __EMSCRIPTEN__
    EM_ASM({
        if (Module.qtCallbacks && Module.qtCallbacks.sendToReact) {
            Module.qtCallbacks.sendToReact(UTF8ToString($0));
        }
    }, utf8.constData());
#else
    qDebug() << "JS bridge called (native):" << msg;
#endif
}

#include "globals.h"

#ifdef __EMSCRIPTEN__
// Free function wrappers for JS
extern "C" {
// JS → Qt bridge
// malloc, ccall, lenthBytesUTF8 "EXPORTED_RUNTIME_METHODS" cannot be set (override by Qt) so Strings are currently not an option JS -> Qt
EMSCRIPTEN_KEEPALIVE
    void receiveNumberFromJS(int value) {
        cBridge.numberReceived(value);
    }

EMSCRIPTEN_KEEPALIVE
    void receiveStringFromJS(const char* msg) {
        QString qmsg = QString::fromUtf8(msg);
        cBridge.receiveMessageFromJS(qmsg);
    }

// Qt -> JS bridge
EMSCRIPTEN_KEEPALIVE
    void sendMessageToJS(const char* msg) {
        QString qmsg = QString::fromUtf8(msg);
        cBridge.sendMessageToJS(qmsg);
    }

}
#endif
