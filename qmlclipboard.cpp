#include <QGuiApplication>
#include <QClipboard>
#include "qmlclipboard.h"

QmlClipboard::QmlClipboard(QObject *parent)
    : QObject(parent)
    , clipboard(QGuiApplication::clipboard())
{
}

QString QmlClipboard::text() const
{
    return clipboard->text();
}

void QmlClipboard::setText(const QString &text)
{
    clipboard->setText(text);
}
