#ifndef QMLURL_H
#define QMLURL_H
#include <QObject>
#include <QUrl>

class QmlUrl : public QObject, QUrl
{
    Q_OBJECT
    Q_PROPERTY(QString url READ url WRITE setUrl)

    Q_PROPERTY(bool isValid READ isValid)
    Q_PROPERTY(QString errorString READ errorString)

    Q_PROPERTY(bool isEmpty READ isEmpty)

    Q_PROPERTY(QString scheme READ scheme WRITE setScheme)
    Q_PROPERTY(QString authority READ authority WRITE setAuthority)
    Q_PROPERTY(QString userInfo READ userInfo WRITE setUserInfo)
    Q_PROPERTY(QString userName READ userName WRITE setUserName)
    Q_PROPERTY(QString password READ password WRITE setPassword)
    Q_PROPERTY(QString host READ host WRITE setHost)
    Q_PROPERTY(int port READ port WRITE setPort)
    Q_PROPERTY(QString path READ path WRITE setPath)

    Q_PROPERTY(QString fileName READ fileName)

    Q_PROPERTY(bool hasQuery READ hasQuery)
    Q_PROPERTY(QString query READ query WRITE setQuery)

    Q_PROPERTY(bool hasFragment READ hasFragment)
    Q_PROPERTY(QString fragment READ fragment WRITE setFragment)

    Q_PROPERTY(bool isRelative READ isRelative)

    Q_PROPERTY(bool isLocalFile READ isLocalFile)
    Q_PROPERTY(QString toLocalFile READ toLocalFile)

    Q_PROPERTY(QString toDisplayString READ toDisplayString)
    Q_PROPERTY(QString toString READ toString)

public:
    Q_INVOKABLE QString resolved(const QString &relativeUrl);
};

#endif // QMLURL_H
