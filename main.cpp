#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include "qmlurl.h"
#include "qmlclipboard.h"


int main(int argc, char *argv[])
{
#if QT_VERSION < QT_VERSION_CHECK(6, 0, 0)
    QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
#endif

    QGuiApplication app(argc, argv);
    app.setOrganizationName("Oleg Blednov");
    app.setOrganizationDomain("co-dev.ru");
    app.setApplicationName("Password Hasher");

    qmlRegisterType<QmlUrl>("ru.co_dev.passhash", 1, 0, "QmlUrl");
    qmlRegisterType<QmlClipboard>("ru.co_dev.passhash", 1, 0, "QmlClipboard");

    const QUrl url(QStringLiteral("qrc:/main.qml"));
    QQmlApplicationEngine engine;
    QObject::connect(&engine, &QQmlApplicationEngine::objectCreated, &app, [url](QObject *obj, const QUrl &objUrl) {
        if (!obj && url == objUrl) {
            QCoreApplication::exit(-1);
        }
    }, Qt::QueuedConnection);
    engine.load(url);
    return app.exec();
}
