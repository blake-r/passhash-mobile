#include <QGuiApplication>
#include <QClipboard>
#include "qmlclipboard.h"

QmlClipboard::QmlClipboard(QObject *parent)
    : QObject(parent)
    , clipboard(QGuiApplication::clipboard())
{
    QObject::connect(clipboard, &QClipboard::dataChanged, this, &QmlClipboard::dataChanged);
}

QString QmlClipboard::text() const
{
    return clipboard->text();
}

void QmlClipboard::setText(const QString &text)
{
    clipboard->setText(text);
}
