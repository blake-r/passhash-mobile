import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12
import Qt.labs.settings 1.0

Page {
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

    function updateData(text) {
        let parsedData = []
        text.split('\n').forEach(function (line) {
            let array = line.split(' ', 1)
            let siteTag = array[0], settings = array[1]
            array = siteTag.split(':')
            let lastIdx = array.length - 1
            let version = lastIdx >= 0 ? parseInt(array[lastIdx]) : NaN
            if (!isNaN(version)) {
                array = array.slice(0, lastIdx)
            }
            let parsedLine = {
                "siteTag": siteTag,
                "array": array,
                "text": array.join(':'),
                "version": version,
                "settings": settings
            }
            parsedData.push(parsedLine)
        })
        data = parsedData
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
                updateData(textArea.text)
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
