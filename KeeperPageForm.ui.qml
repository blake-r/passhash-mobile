import QtQuick 2.12
import QtQuick.Controls 2.12

Frame {
    padding: 0

    readonly property alias textArea: textArea

    ScrollView {
        anchors.fill: parent
        ScrollBar.horizontal.policy: ScrollBar.AlwaysOff

        TextArea {
            id: textArea
            readOnly: true
            wrapMode: TextEdit.Wrap
        }
    }
}
