import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12
import Qt.labs.settings 1.0
import "keeper-utils.js" as KeeperUtils

Page {
    id: page
    padding: 6
    bottomPadding: 0

    property var data: []

    function read(siteTag, requirements, restrictions) {
        console.log(siteTag)
        console.log('read() not implemented yet')
    }

    function write(siteTag, requirements, restrictions) {
        console.log(siteTag)
        console.log(requirements)
        console.log(restrictions)
        console.log('write() is not implemented yet')
    }

    Settings {
        id: storage
        category: "Keeper"
        property string data: 'google\napple'
    }

    KeeperPageForm {
        id: form
        anchors.fill: parent

        textArea {
            text: storage.data
            onTextChanged: {
                storage.data = textArea.text
                page.data = KeeperUtils.parseKeeperText(textArea.text)
            }
        }
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
