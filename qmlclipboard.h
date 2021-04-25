#ifndef CLIPBOARDCHECKER_H
#define CLIPBOARDCHECKER_H
#include <QObject>
#include <QClipboard>

class QmlClipboard : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QString text READ text WRITE setText)
public:
    QmlClipboard(QObject *parent = nullptr);
    Q_INVOKABLE QString text() const;
    Q_INVOKABLE void setText(const QString &text);
private:
    QClipboard *clipboard;
};

#endif // CLIPBOARDCHECKER_H
