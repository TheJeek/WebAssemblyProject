#ifndef ALGORITHM_H
#define ALGORITHM_H

#include <QObject>
#include <QVariantList>
#include <QElapsedTimer>

class Algorithm : public QObject
{
    Q_OBJECT
public:
    explicit Algorithm(QObject *parent = nullptr);

    Q_INVOKABLE QVariantList computeSeriesIterative(int n);
    Q_INVOKABLE QVariantList computeSeriesRecursive(int n);
    Q_INVOKABLE void requestStatistics();
    Q_INVOKABLE int singleTest(int k);
    Q_INVOKABLE void incrementalTest(int n);
    Q_INVOKABLE void runSieve(int n);

private:
    qint64 fibRec(int n, int depth, int& maxDepth);
    qint64 fibIter(int n);
    uint64_t factorial(int n);
    bool isPrime(int n);

signals:
    void testResult(int k, int result, int maxDepth, uintptr_t stackBefore, uintptr_t stackAfter, uintptr_t stackAverage, QString executionTime, QString deployment, uint64_t callCount);
    void testFinished();
    void statisticsReceived(
        int sizeInt,
        int sizeLong,
        int sizeBool,
        int sizeVoidPtr,
        int sizeSharedPtr,
        int sizeUniquePtr,
        int sizeChar,
        int sizeShort,
        int sizeLongLong,
        int sizeFloat,
        int sizeDouble,
        int sizeLongDouble,
        int sizeIntPtr,
        int sizeVector,
        int sizeString,
        int sizeArray,
        int sizePair,
        int sizeUIntPtr,
        int sizeSizeT,
        int sizeStruct
        );
};

#endif // ALGORITHM_H
