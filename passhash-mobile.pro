TARGET = passhash-mobile


QT += quick

CONFIG += c++11

# You can make your code fail to compile if it uses deprecated APIs.
# In order to do so, uncomment the following line.
DEFINES += QT_DISABLE_DEPRECATED_BEFORE=0x060000    # disables all the APIs deprecated before Qt 6.0.0

SOURCES += \
        main.cpp \
        qmlclipboard.cpp \
        qmlurl.cpp

HEADERS += \
    qmlclipboard.h \
    qmlurl.h

RESOURCES += qml.qrc

# Additional import path used to resolve QML modules in Qt Creator's code model
QML_IMPORT_PATH =

# Additional import path used to resolve QML modules just for Qt Quick Designer
QML_DESIGNER_IMPORT_PATH =

# Default rules for deployment.
qnx: target.path = /tmp/$${TARGET}/bin
else: unix:!android: target.path = /opt/$${TARGET}/bin
!isEmpty(target.path): INSTALLS += target

android {

    QMAKE_LFLAGS += -Wl,-z,max-page-size=16384
    QMAKE_LFLAGS_RELEASE += -Wl,-z,max-page-size=16384

    ANDROID_VERSION_NAME = $$system("date +%Y.%m.%d")
    # Max value is 2100000000
    ANDROID_VERSION_CODE = $$system("date +00%y%m%d%H")

    ANDROID_PACKAGE_SOURCE_DIR = $$PWD/android515

    DISTFILES += \
        $$ANDROID_PACKAGE_SOURCE_DIR/AndroidManifest.xml \
        $$ANDROID_PACKAGE_SOURCE_DIR/build.gradle \
        $$ANDROID_PACKAGE_SOURCE_DIR/gradle.properties \
        $$ANDROID_PACKAGE_SOURCE_DIR/gradle/wrapper/gradle-wrapper.jar \
        $$ANDROID_PACKAGE_SOURCE_DIR/gradle/wrapper/gradle-wrapper.properties \
        $$ANDROID_PACKAGE_SOURCE_DIR/gradlew \
        $$ANDROID_PACKAGE_SOURCE_DIR/gradlew.bat \
        $$ANDROID_PACKAGE_SOURCE_DIR/res/values/libs.xml

}

ios {

    TARGET = "Password Hasher"
    VERSION = $$system("date +%Y.%m.%d%H")
    QMAKE_TARGET_BUNDLE_PREFIX = "ru.co-dev"
    QMAKE_BUNDLE = "passhash"

    CONFIG += sdk_no_version_check

    QMAKE_ASSET_CATALOGS = $$PWD/ios/Assets.xcassets
    QMAKE_ASSET_CATALOGS_APP_ICON = "AppIcon"

}
