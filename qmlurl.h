#ifndef QMLURL_H
#define QMLURL_H
#include <QObject>

class QmlUrl : public QObject
{
    Q_OBJECT
public:
    Q_INVOKABLE QString siteTagFromUrl(const QString &text) const;
};

#endif // QMLURL_H
