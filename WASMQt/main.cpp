#include "mainwindow.h"

#include <QApplication>
#include <QDir>
#include <QQmlEngine>
#include <QQuickView>
#include <QQmlContext>
#include "fibonacci.h"
#include "communicationbridge.h"
#include "manorboy.h"
#include "manorboyoptimized.h"
#include <QTimer>
#include "globals.h"

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    Fibonacci fib;
    ManOrBoy mob;
    ManOrBoyOptimized mobo;

    QQuickView viewer;
    viewer.setMinimumSize({1200, 800});
    QObject::connect(viewer.engine(), &QQmlEngine::quit, &viewer, &QWindow::close);

    viewer.engine()->rootContext()->setContextProperty("fibonacci", &fib);
    viewer.engine()->rootContext()->setContextProperty("mob", &mob);
    viewer.engine()->rootContext()->setContextProperty("mobopt", &mobo);
    viewer.engine()->rootContext()->setContextProperty("communicationBridge", &cBridge);

    viewer.setTitle(QStringLiteral("Comparison WASM vs Native"));
    viewer.setSource(QUrl("qrc:/qml/Homepage.qml"));
    viewer.setResizeMode(QQuickView::SizeRootObjectToView);
    viewer.show();

    return app.exec();
}
