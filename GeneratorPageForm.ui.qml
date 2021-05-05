import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12

ColumnLayout {
    id: form

    readonly property alias generator: generator
    readonly property alias settings: settings
    readonly property alias hinter: hinter

    GridLayout {
        // Placing elements from top to bottom is preferred
        flow: form.width * 0.7 < form.height ? GridLayout.TopToBottom : GridLayout.LeftToRight
        rowSpacing: 6
        columnSpacing: 6
        Layout.fillHeight: false
        Layout.alignment: Qt.AlignLeft | Qt.AlignTop

        GeneratorForm {
            id: generator
        }

        HashSettingsForm {
            id: settings
        }
    }

    GroupBox {
        title: qsTr("Site tag hints")
        Layout.fillWidth: true
        Layout.fillHeight: true

        Flow {
            flow: Flow.LeftToRight
            spacing: 6

            Repeater {
                id: hinter
                model: []
            }
        }
    }
}

/*##^##
Designer {
    D{i:0;autoSize:true;formeditorColor:"#4c4e50";height:480;width:320}
}
##^##*/

