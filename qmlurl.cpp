#include <QUrl>
#include "qmlurl.h"

QString QmlUrl::resolved(const QString &relativeUrl)
{
    return QUrl::resolved(QUrl(relativeUrl)).url();
}
