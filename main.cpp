#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include "qmlurl.h"


int main(int argc, char *argv[])
{
#if QT_VERSION < QT_VERSION_CHECK(6, 0, 0)
    QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
#endif

    QGuiApplication app(argc, argv);
    app.setOrganizationName("Oleg Blednov");
    app.setOrganizationDomain("co-dev.ru");
    app.setApplicationName("Password Hasher");

    qmlRegisterType<QmlUrl>("ru.co_dev.passhash", 2, 0, "QmlUrl");

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
