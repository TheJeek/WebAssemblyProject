#ifndef COMMUNICATIONBRIDGE_H
#define COMMUNICATIONBRIDGE_H
#include <QObject>

class CommunicationBridge : public QObject
{
    Q_OBJECT
public:
    explicit CommunicationBridge(QObject *parent = nullptr);

    Q_INVOKABLE void sendMessageToJS(const QString &msg);
    Q_INVOKABLE void receiveMessageFromJS(const QString &msg);
    Q_INVOKABLE void receiveNumberFromJS(const int &number);


    static CommunicationBridge* instance();
    static void setInstance(CommunicationBridge* inst);
private:
    qint64 fibRec(int n);
    qint64 fibIter(int n);
    static CommunicationBridge* staticInstance;

signals:
    void stringReceived(QString msg);
    void numberReceived(int number);
    void test();
};
#endif // COMMUNICATIONBRIDGE_H

