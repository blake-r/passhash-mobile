import QtQuick 2.12
import QtQuick.Controls 2.5

Page {
    id: page
    width: 320

    property alias siteTag: siteTag
    property alias masterKey: masterKey
    property alias hashWord: hashWord
    property alias bump: bump
    property alias generate: generate
    property alias requireDigits: requireDigits
    property alias requirePunctuation: requirePunctuation
    property alias requireMixedCase: requireMixedCase
    property alias restrictNoSpecial: restrictNoSpecial
    property alias restrictDigitsOnly: restrictDigitsOnly
    property alias passwordLength: passwordLength

    Column {
        spacing: 5
        width: page.width - page.padding * 2

        readonly property int childWidth: width - padding * 2

        Frame {
            width: parent.childWidth

            Grid {
                columns: 3
                rows: 3
                spacing: 7
                verticalItemAlignment: Grid.AlignVCenter

                // Row #1
                Label {
                    text: qsTr("Site tag")
                }
                TextField {
                    id: siteTag
                    placeholderText: qsTr("Site tag")
                }
                Button {
                    id: bump
                    text: "Bump"
                }

                // Row #2
                Label {
                    text: qsTr("Master key")
                }
                TextField {
                    id: masterKey
                    placeholderText: qsTr("Master key")
                    echoMode: unmask.checked ? "Normal" : "Password"
                }
                CheckBox {
                    id: unmask
                    text: qsTr("Unmask")
                    padding: 0
                }

                // Row #3
                Label {
                    text: qsTr("Password")
                }
                TextField {
                    id: hashWord
                    placeholderText: qsTr("Password")
                    readOnly: true
                }
                Button {
                    id: generate
                    text: "Generate"
                }
            }
        }

        Row {
            id: options
            spacing: 5
            width: parent.childWidth

            readonly property int childWidth: (width - padding * 2 - spacing) / 2

            GroupBox {
                id: requirements
                title: qsTr("Requirements")
                width: parent.childWidth

                Column {
                    CheckBox {
                        id: requireDigits
                        text: qsTr("Digits")
                    }
                    CheckBox {
                        id: requirePunctuation
                        text: qsTr("Punctuation")
                        enabled: !restrictNoSpecial.checked
                                 && !restrictDigitsOnly.checked
                    }
                    CheckBox {
                        id: requireMixedCase
                        text: qsTr("Mixed case")
                        enabled: !restrictDigitsOnly.checked
                    }
                }
            }

            GroupBox {
                id: restrictions
                title: qsTr("Restrictions")
                width: parent.childWidth

                Column {
                    CheckBox {
                        id: restrictNoSpecial
                        text: qsTr("No special")
                    }
                    CheckBox {
                        id: restrictDigitsOnly
                        text: qsTr("Digits only")
                    }
                    Row {
                        id: row
                        padding: 2
                        spacing: 6

                        Label {
                            text: qsTr("Size") + ":"
                            anchors.verticalCenter: passwordLength.verticalCenter
                            padding: 4
                        }
                        ComboBox {
                            id: passwordLength
                            model: [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26]
                            flat: true
                            width: 50
                        }
                    }
                }
            }
        }
    }
}

/*##^##
Designer {
    D{i:0;height:480;width:320}
}
##^##*/

