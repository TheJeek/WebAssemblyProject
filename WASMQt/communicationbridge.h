#ifndef COMMUNICATIONBRIDGE_H
#define COMMUNICATIONBRIDGE_H
#include <QObject>

class CommunicationBridge : public QObject
{
    Q_OBJECT
public:
    explicit CommunicationBridge(QObject *parent = nullptr);

    Q_INVOKABLE void sendMessageToJS(const QString &msg);
    Q_INVOKABLE void receiveMessageFromJS(const int &msg);

private:
    qint64 fibRec(int n);
    qint64 fibIter(int n);
};
#endif // COMMUNICATIONBRIDGE_H

