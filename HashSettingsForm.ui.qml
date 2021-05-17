import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12

GridLayout {
    columns: 2
    columnSpacing: 6
    rowSpacing: 6

    readonly property alias digits: digits
    readonly property alias punctuation: punctuation
    readonly property alias mixedCase: mixedCase
    readonly property alias noSpecial: noSpecial
    readonly property alias digitsOnly: digitsOnly
    readonly property alias length: length

    GroupBox {
        title: qsTr("Requirements")
        Layout.fillWidth: true
        Layout.fillHeight: true

        ColumnLayout {
            CheckBox {
                id: digits
                text: qsTr("Digits")
                Layout.fillWidth: true
            }
            CheckBox {
                id: punctuation
                text: qsTr("Punctuation")
                enabled: !noSpecial.checked && !digitsOnly.checked
                Layout.fillWidth: true
            }
            CheckBox {
                id: mixedCase
                text: qsTr("Mixed case")
                enabled: !digitsOnly.checked
                Layout.fillWidth: true
            }
        }
    }

    GroupBox {
        title: qsTr("Restrictions")
        Layout.fillWidth: true
        Layout.fillHeight: true

        ColumnLayout {
            CheckBox {
                id: noSpecial
                text: qsTr("No special")
                Layout.fillWidth: true
            }
            CheckBox {
                id: digitsOnly
                text: qsTr("Digits only")
                Layout.fillWidth: true
            }
            RowLayout {
                Layout.margins: 3

                Label {
                    text: qsTr("Size") + ":"
                    Layout.leftMargin: 4
                    Layout.alignment: Qt.AlignRight | Qt.AlignVCenter
                }
                ComboBox {
                    id: length
                    Layout.fillHeight: false
                    model: [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26]
                    flat: true
                    Layout.preferredWidth: 60
                    Layout.fillWidth: true
                }
            }
        }
    }
}

/*##^##
Designer {
    D{i:0;autoSize:true;formeditorColor:"#4c4e50"}
}
##^##*/

