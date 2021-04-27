import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12

GridLayout {
    property alias requireDigits: requireDigits
    property alias requirePunctuation: requirePunctuation
    property alias requireMixedCase: requireMixedCase
    property alias restrictNoSpecial: restrictNoSpecial
    property alias restrictDigitsOnly: restrictDigitsOnly
    property alias passwordLength: passwordLength

    columns: 2
    columnSpacing: 6
    rowSpacing: 6

    GroupBox {
        title: qsTr("Requirements")
        Layout.fillWidth: true
        Layout.fillHeight: true

        ColumnLayout {
            CheckBox {
                id: requireDigits
                text: qsTr("Digits")
                Layout.fillWidth: true
            }
            CheckBox {
                id: requirePunctuation
                text: qsTr("Punctuation")
                enabled: !restrictNoSpecial.checked
                         && !restrictDigitsOnly.checked
                Layout.fillWidth: true
            }
            CheckBox {
                id: requireMixedCase
                text: qsTr("Mixed case")
                enabled: !restrictDigitsOnly.checked
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
                id: restrictNoSpecial
                text: qsTr("No special")
                Layout.fillWidth: true
            }
            CheckBox {
                id: restrictDigitsOnly
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
                    id: passwordLength
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

