import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12
import Qt.labs.settings 1.0
import "utils-keeper.js" as KeeperUtils

Page {
    id: page
    leftPadding: 6
    rightPadding: 6

    function onDataChange(keeperTxt) {
        storage.data = keeperTxt
        form.textArea.text = keeperTxt
    }

    Settings {
        id: storage
        category: "Keeper"
        property string data

        Component.onCompleted: {
            data = 'google:1=DpMso8\napple:2=dPmsO24'
            KeeperUtils.initKeeperData(data, onDataChange)
        }
    }

    KeeperPageForm {
        id: form
        anchors.fill: parent
    }

    footer: RowLayout {
        spacing: 0

        Button {
            text: qsTr("Export")
            Layout.fillWidth: true
            Layout.margins: 6
        }
        Button {
            text: qsTr("Import")
            Layout.fillWidth: true
            Layout.margins: 6
        }
    }
}
