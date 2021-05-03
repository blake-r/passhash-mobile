import QtQuick 2.12
import QtQuick.Controls 2.12

Frame {
    property alias textArea: textArea

    padding: 0

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
