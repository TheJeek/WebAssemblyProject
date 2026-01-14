#include "algorithm.h"
#include <memory>
#include <vector>
#include <string>
#include <array>
#include <utility>
#include <cstdint>

Algorithm::Algorithm(QObject *parent)
    : QObject(parent)
{}

// 9,223,372,036,854,775,807 (qint64::max)
// largest fib(92) = 7,540,113,804,746,346,429

qint64 Algorithm::fibIter(int n) {
    if (n <= 1) return n;
    qint64 a = 0, b = 1;
    for (int i = 2; i <= n; ++i) {
        qint64 c = a + b;
        a = b;
        b = c;
    }
    return b;
}

qint64 Algorithm::fibRec(int n) {
    if (n <= 1) return n;
    return fibRec(n - 1) + fibRec(n - 2);
}

bool Algorithm::isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i*i <= n; i++)
        if (n % i == 0) return false;
    return true;
}

uint64_t Algorithm::factorial(int n) {
    uint64_t f = 1;
    for (int i=2; i<=n; i++) f *= i;
    return f;
}


QVariantList Algorithm::computeSeriesIterative(int n)
{
    QVariantList result;
    if (n > 92) {
        return result;
    }
    QElapsedTimer timer;
    timer.start();

    for (int i = 0; i <= n; i++) {
        fibIter(i);
        qint64 duration = timer.nsecsElapsed(); // μs (nanoseconds)
        QVariantMap dataPoint;
        dataPoint.insert("index", QVariant::fromValue(i));
        //dataPoint.insert("value", QVariant::fromValue(static_cast<double>(value)));
        dataPoint.insert("duration", QVariant::fromValue(static_cast<double>(duration)));

        result.append(dataPoint);


    }
    qDebug() << result.size();
    timer.invalidate();
    return result;
}

QVariantList Algorithm::computeSeriesRecursive(int n)
{
    QVariantList result;
    if (n > 92) {
        return result;
    }
    QElapsedTimer timer;
    timer.start();

    for (int i = 0; i <= n; i++) {
        fibRec(i);
        qint64 duration = timer.nsecsElapsed(); // μs (nanoseconds)
        QVariantMap dataPoint;
        dataPoint.insert("index", QVariant::fromValue(i));
        //dataPoint.insert("value", QVariant::fromValue(static_cast<double>(value)));
        dataPoint.insert("duration", QVariant::fromValue(static_cast<double>(duration)));

        result.append(dataPoint);
    }

    timer.invalidate();
    return result;
}

void Algorithm::requestStatistics() {
    using Struct = struct { char c; int i; };
    using Array = std::array<int, 5>;
    using Pair = std::pair<int, double>;

    emit statisticsReceived(sizeof(int),
                            sizeof(long),
                            sizeof(bool),
                            sizeof(void*),
                            sizeof(std::shared_ptr<int>),
                            sizeof(std::unique_ptr<int>),
                            sizeof(char),
                            sizeof(short),
                            sizeof(long long),
                            sizeof(float),
                            sizeof(double),
                            sizeof(long double),
                            sizeof(int*),
                            sizeof(std::vector<int>),
                            sizeof(std::string),
                            sizeof(Array),
                            sizeof(Pair),
                            sizeof(uintptr_t),
                            sizeof(size_t),
                            sizeof(Struct));
}
