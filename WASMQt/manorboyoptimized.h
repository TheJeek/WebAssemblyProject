#ifndef MANORBOYOPTIMIZED_H
#define MANORBOYOPTIMIZED_H

#include <QObject>

class ManOrBoyOptimized : public QObject
{
    Q_OBJECT
public:
    explicit ManOrBoyOptimized(QObject *parent = nullptr);
    Q_INVOKABLE int singleTest(int k);
    Q_INVOKABLE void incrementalTest(int n);

signals:
    void testResult(int k, int result, int maxDepth, uintptr_t stackBefore, uintptr_t stackAfter, uintptr_t stackAverage, QString executionTime, QString deployment);
    void testFinished();
};

#endif // MANORBOYOPTIMIZED_H
