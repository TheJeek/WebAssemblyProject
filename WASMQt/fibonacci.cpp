#include "fibonacci.h"

Fibonacci::Fibonacci(QObject *parent)
    : QObject(parent)
{}

qint64 Fibonacci::fibIter(int n) {
    if (n <= 1) return n;
    qint64 a = 0, b = 1;
    for (int i = 2; i <= n; ++i) {
        qint64 c = a + b;
        a = b;
        b = c;
    }
    return b;
}

qint64 Fibonacci::fibRec(int n) {
    if (n <= 1) return n;
    return fibRec(n - 1) + fibRec(n - 2);
}



QVariantList Fibonacci::computeSeries(int n)
{
    QVariantList result;
    QElapsedTimer timer;
    timer.start();
    int step = 1;
    if (n>1000){
        step = 10;
    }
    else if (n > 10000){
        step = 100;
    }
    else if (n > 100000) {
        step = 1000;
    }

    for (int i = 0; i <= n; i += step) {

        qint64 value = fibIter(i);
        qint64 duration = timer.nsecsElapsed(); // μs (microseconds)

        QVariantMap dataPoint;
        dataPoint.insert("index", QVariant::fromValue(i));
        dataPoint.insert("value", QVariant::fromValue(static_cast<double>(value)));
        dataPoint.insert("duration", QVariant::fromValue(static_cast<double>(duration)));

        result.append(dataPoint);
    }

    timer.invalidate();
    return result;
}
