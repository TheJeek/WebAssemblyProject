#ifndef MANORBOY_H
#define MANORBOY_H
#include <QObject>

class ManOrBoy : public QObject
{
        Q_OBJECT
public:
    explicit ManOrBoy(QObject *parent = nullptr);
    Q_INVOKABLE void singleTest(int k);
    Q_INVOKABLE void incrementalTest();

signals:
    void testResult(int k, int result, int maxDepth);
    void testFinished();
};

#endif // MANORBOY_H
