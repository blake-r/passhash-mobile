#ifndef CLIPBOARDCHECKER_H
#define CLIPBOARDCHECKER_H
#include <QObject>
#include <QClipboard>

class QmlClipboard : public QObject
{
    Q_OBJECT
public:
    QmlClipboard(QObject *parent = nullptr);

    Q_PROPERTY(QString text READ text WRITE setText)

    Q_INVOKABLE QString text() const;
    Q_INVOKABLE void setText(const QString &text);

    Q_SIGNAL void dataChanged() const;

private:
    QClipboard *clipboard;
};

#endif // CLIPBOARDCHECKER_H
