import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12
import Qt.labs.settings 1.0
import "utils-keeper.js" as KeeperUtils

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

    function findHints(siteObj) {
        const result = []
        const tag = siteObj.tag
        if (tag.length > 0) {
            for (const i in data) {
                const keepObj = data[i]
                for (const j in keepObj.path) {
                    const part = keepObj.path[j]
                    if (part.startsWith(tag)) {
                        result.push(keepObj)
                        break
                    }
                }
            }
        }
        return result
    }

    Settings {
        id: storage
        category: "Keeper"
        property string data: 'google:1 DpCsO8\napple:2\nya'

        Component.onCompleted: {
            form.textArea.text = data
        }
    }

    KeeperPageForm {
        id: form
        anchors.fill: parent

        textArea {
            text: ' '

            onTextChanged: {
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
