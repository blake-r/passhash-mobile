import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12
import Qt.labs.settings 1.0
import ru.co_dev.passhash 3.0
import "utils-keeper.js" as KeeperUtils

Page {
    id: page
    leftPadding: 6
    rightPadding: 6

    function changeData(keeperTxt) {
        storage.data = keeperTxt
    }

    QmlClipboard {
        id: clipboard
    }

    Settings {
        id: storage
        category: "Keeper"
        property string data

        Component.onCompleted: {
            KeeperUtils.initKeeperData(changeData)
        }
        onDataChanged: {
            KeeperUtils.updateKeeperData(data)
            form.textArea.text = data
        }
    }

    KeeperPageForm {
        id: form
        anchors.fill: parent
    }

    Dialog {
        id: confirmImport
        title: qsTr("Import confirmation")
        modal: true
        standardButtons: Dialog.Yes | Dialog.No
        x: (parent.width - width) / 2
        y: parent.height - height - bottomMargin
        width: parent.width - leftMargin - rightMargin
        margins: 6

        onAccepted: {
            storage.data = clipboard.text
            status.show(qsTr("Keeper data imported from clipboard"), "orange")
        }
        onRejected: {
            status.show(qsTr("Keeper data is left unchanged"), "gray")
        }

        Label {
            anchors.fill: parent
            text: qsTr("Import replaces the current keeper data with the current clipboard text.\nAre you sure you want to import?")
            wrapMode: Text.WordWrap
        }
    }

    footer: ColumnLayout {
        width: parent.width

        StatusLabel {
            id: status
            horizontalAlignment: Text.AlignHCenter
            Layout.fillWidth: true
            Layout.margins: 6
            Layout.bottomMargin: 0
        }

        RowLayout {
            spacing: 6
            Layout.margins: 6

            Button {
                text: qsTr("Export")
                Layout.fillWidth: true
                onClicked: {
                    clipboard.text = storage.data
                    status.show(qsTr("Keeper data exported into clipboard"),
                                'green')
                }
            }
            Button {
                text: qsTr("Import")
                Layout.fillWidth: true
                onClicked: confirmImport.open()
            }
        }
    }
}
