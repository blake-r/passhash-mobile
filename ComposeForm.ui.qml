import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12

GridLayout {
    property alias siteTag: generator.siteTag
    property alias masterKey: generator.masterKey
    property alias unmask: generator.unmask
    property alias bumpBtn: generator.bumpBtn
    property alias generateBtn: generator.generateBtn

    property alias requireDigits: settings.requireDigits
    property alias requirePunctuation: settings.requirePunctuation
    property alias requireMixedCase: settings.requireMixedCase
    property alias restrictNoSpecial: settings.restrictNoSpecial
    property alias restrictDigitsOnly: settings.restrictDigitsOnly
    property alias passwordLength: settings.passwordLength

    anchors.fill: parent

    GridLayout {
        // Placing element from top to bottom is preferred
        flow: parent.width * 0.8 < parent.height ? GridLayout.TopToBottom : GridLayout.LeftToRight
        Layout.fillHeight: false
        Layout.alignment: Qt.AlignLeft | Qt.AlignTop

        GeneratorForm {
            id: generator
        }

        HashSettingsForm {
            id: settings
        }
    }
}

/*##^##
Designer {
    D{i:0;formeditorColor:"#4c4e50";height:480;width:320}
}
##^##*/

