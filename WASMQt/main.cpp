#include "mainwindow.h"

#include <QApplication>
#include <QDir>
#include <QQmlEngine>
#include <QQuickView>
#include <QQmlContext>
#include "algorithm.h"
#include "communicationbridge.h"
#include <QTimer>

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    Algorithm algo;
    CommunicationBridge bridge;

    QQuickView viewer;
    viewer.setMinimumSize({1200, 800});
    QObject::connect(viewer.engine(), &QQmlEngine::quit, &viewer, &QWindow::close);

    viewer.engine()->rootContext()->setContextProperty("algorithm", &algo);
    viewer.engine()->rootContext()->setContextProperty("cBridge", bridge.instance());

    viewer.setTitle(QStringLiteral("Comparison WASM vs Native"));
    viewer.setSource(QUrl("qrc:/qml/Homepage.qml"));
    viewer.setResizeMode(QQuickView::SizeRootObjectToView);
    viewer.show();

    return app.exec();
}
