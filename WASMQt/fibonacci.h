#ifndef FIBONACCI_H
#define FIBONACCI_H

#include <QObject>
#include <QVariantList>
#include <QElapsedTimer>

class Fibonacci : public QObject
{
    Q_OBJECT
public:
    explicit Fibonacci(QObject *parent = nullptr);

    Q_INVOKABLE QVariantList computeSeries(int n);

private:
    qint64 fibRec(int n);
    qint64 fibIter(int n);
};

#endif // FIBONACCI_H
