#include "mainwindow.h"

#include <QApplication>
#include <QDir>
#include <QQmlEngine>
#include <QQuickView>
#include <QQmlContext>
#include "fibonacci.h"
#include "communicationbridge.h"
#include <emscripten.h>
#include <QTimer>

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    Fibonacci fib;
    CommunicationBridge bridge;

    QQuickView viewer;
    viewer.setMinimumSize({600, 400});
    QObject::connect(viewer.engine(), &QQmlEngine::quit, &viewer, &QWindow::close);

    viewer.engine()->rootContext()->setContextProperty("fibonacci", &fib);
    viewer.engine()->rootContext()->setContextProperty("communicationbridge", &bridge);

    viewer.setTitle(QStringLiteral("Algorithm Visualization"));
    viewer.setSource(QUrl("qrc:/qml/Main.qml"));
    viewer.setResizeMode(QQuickView::SizeRootObjectToView);
    viewer.show();

    return app.exec();
}
