import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12

ColumnLayout {
    id: form

    property alias siteTag: generator.siteTag
    property alias masterKey: generator.masterKey
    property alias hashWord: generator.hashWord
    property alias unmask: generator.unmask
    property alias bumpBtn: generator.bumpBtn
    property alias generateBtn: generator.generateBtn

    property alias requireDigits: settings.requireDigits
    property alias requirePunctuation: settings.requirePunctuation
    property alias requireMixedCase: settings.requireMixedCase
    property alias restrictNoSpecial: settings.restrictNoSpecial
    property alias restrictDigitsOnly: settings.restrictDigitsOnly
    property alias passwordLength: settings.passwordLength

    property alias hinter: hinter

    GridLayout {
        // Placing elements from top to bottom is preferred
        flow: form.width * 0.7 < form.height ? GridLayout.TopToBottom : GridLayout.LeftToRight
        rowSpacing: 6
        columnSpacing: 6
        Layout.fillHeight: false
        Layout.alignment: Qt.AlignLeft | Qt.AlignTop
        Layout.margins: 6
        Layout.topMargin: 0

        GeneratorForm {
            id: generator
        }

        HashSettingsForm {
            id: settings
        }
    }

    Flow {
        flow: Flow.LeftToRight
        Layout.fillHeight: true
        Layout.fillWidth: true
        Layout.leftMargin: 6
        Layout.rightMargin: 6
        spacing: 6

        Repeater {
            id: hinter
            model: []
        }
    }
}

/*##^##
Designer {
    D{i:0;formeditorColor:"#4c4e50";height:480;width:320}
}
##^##*/

