#include <QUrl>
#include "qmlurl.h"

QString QmlUrl::siteTagFromUrl(const QString &text) const {
    QUrl url = QUrl(text, QUrl::StrictMode);
    if (!url.isValid() || url.isEmpty() || url.isLocalFile() || url.isRelative()) {
        return text;
    }
    QStringList parts = url.host().split('.');
    if (parts[0] == "www") {
        // www.google.com -> google.com
        parts.removeFirst();
    }
    if (parts.size() > 1) {
        // google.com -> google
        parts.removeLast();
    }
    if (parts.isEmpty()) {
        return text;
    }
    return parts.last();
}
