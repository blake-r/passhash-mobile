import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12

ApplicationWindow {
    title: "Password Hasher"
    id: root
    width: 320
    height: 480
    visible: true

    header: Label {
        text: root.title
        padding: 5
        horizontalAlignment: Text.AlignHCenter
        font.bold: true
    }

    StackLayout {
        id: stack
        anchors.fill: parent
        currentIndex: tabs.currentIndex

        GeneratorPage {}
        KeeperPage {}
    }

    footer: TabBar {
        id: tabs
        width: parent.width

        TabButton {
            text: qsTr("Generator")
        }
        TabButton {
            text: qsTr("Keeper")
        }
    }
}
