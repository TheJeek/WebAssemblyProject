#include "communicationbridge.h"
#include <QString>
#include <QDebug>
#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif
#include <QTimer>

CommunicationBridge gBridge;

CommunicationBridge::CommunicationBridge(QObject* parent)
    : QObject(parent)
{
}

// Called from C++ internally or from wrapper
void CommunicationBridge::receiveMessageFromJS(const int &msg) {
    qDebug() << "[Qt] Received from JS:" << msg;
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


#ifdef __EMSCRIPTEN__
// Free function wrappers for JS
extern "C" {
// JS → Qt bridge
// malloc, ccall, lenthBytesUTF8 "EXPORTED_RUNTIME_METHODS" cannot be set (override by Qt) so Strings are currently not an option JS -> Qt
EMSCRIPTEN_KEEPALIVE
    void receiveNumberFromJS(int value) {
        qDebug() << "[Qt] Received number from JS:" << value;
        // Do whatever you want with the number
    }

EMSCRIPTEN_KEEPALIVE
    void receiveStringFromJS(const char* msg) {
    QString qmsg = QString::fromUtf8(msg);
    qDebug() << "[Qt] Received String from JS:" << qmsg;
}

// Qt -> JS bridge
EMSCRIPTEN_KEEPALIVE
    void sendMessageToJS(const char* msg) {
        QString qmsg = QString::fromUtf8(msg);
        gBridge.sendMessageToJS(qmsg);
    }

}
#endif
