import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12

Frame {
    Layout.fillWidth: true
    Layout.fillHeight: true

    readonly property alias siteTag: siteTag
    readonly property alias masterKey: masterKey
    readonly property alias hashWord: hashWord
    readonly property alias unmask: unmask
    readonly property alias bumpBtn: bumpBtn
    readonly property alias generateBtn: generateBtn

    GridLayout {
        anchors.fill: parent
        columns: 3
        columnSpacing: 6
        rowSpacing: 6

        readonly property int thirdColumnMinimumWidth: 80
        readonly property int thirdColumnMaximumWidth: 90

        // Row #1
        Label {
            text: qsTr("Site tag")
            Layout.alignment: Qt.AlignRight | Qt.AlignVCenter
        }
        TextField {
            id: siteTag
            placeholderText: qsTr("Site tag")
            inputMethodHints: Qt.ImhSensitiveData | Qt.ImhNoAutoUppercase | Qt.ImhPreferLowercase
            Layout.fillWidth: true
        }
        Button {
            id: bumpBtn
            text: "Bump"
            enabled: siteTag.length > 0
            Layout.minimumWidth: parent.thirdColumnMinimumWidth
            Layout.maximumWidth: parent.thirdColumnMaximumWidth
            Layout.fillWidth: true
        }

        // Row #2
        Label {
            text: qsTr("Master key")
            Layout.alignment: Qt.AlignRight | Qt.AlignVCenter
        }
        TextField {
            id: masterKey
            placeholderText: qsTr("Master key")
            inputMethodHints: Qt.ImhSensitiveData | Qt.ImhNoAutoUppercase | Qt.ImhPreferLowercase
            echoMode: unmask.checked ? "Normal" : "Password"
            Layout.fillWidth: true
        }
        CheckBox {
            id: unmask
            text: qsTr("Unmask")
            padding: 0
            Layout.minimumWidth: parent.thirdColumnMinimumWidth
            Layout.maximumWidth: parent.thirdColumnMaximumWidth
            Layout.fillWidth: true
        }

        // Row #3
        Label {
            text: qsTr("Password")
            Layout.alignment: Qt.AlignRight | Qt.AlignVCenter
        }
        TextField {
            id: hashWord
            placeholderText: qsTr("Password")
            inputMethodHints: Qt.ImhSensitiveData | Qt.ImhNoAutoUppercase
            readOnly: true
            Layout.fillWidth: true
        }
        Button {
            id: generateBtn
            text: "Generate"
            enabled: siteTag.text.length > 0
            Layout.minimumWidth: parent.thirdColumnMinimumWidth
            Layout.maximumWidth: parent.thirdColumnMaximumWidth
            Layout.fillWidth: true
        }
    }
}

/*##^##
Designer {
    D{i:0;autoSize:true;formeditorColor:"#000000";width:500}
}
##^##*/

