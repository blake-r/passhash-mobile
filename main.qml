import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12
import Qt.labs.settings 1.0
import ru.co_dev.passhash 1.0
import "passhash-common.js" as WijjoPassHash

ApplicationWindow {
    title: "Password Hasher"
    id: root
    width: 320
    height: 480
    visible: true

    Settings {
        id: requirements
        category: "Requirements"
        property bool digits: true
        property bool punctuation: false
        property bool mixedCase: true
    }
    Settings {
        id: restrictions
        category: "Restrictions"
        property bool noSpecial: false
        property bool digitsOnly: false
        property int passwordLength: 8
    }
    QmlUrl {
        id: qmlurl
    }
    QmlClipboard {
        id: clipboard
    }

    header: Label {
        text: root.title
        padding: 5
        horizontalAlignment: Text.AlignHCenter
    }

    ComposeForm {
        id: generatorPage

        function splitVersion(siteTag) {
            let array = siteTag.split(':')
            let lastIdx = array.length - 1
            let version = array.length > 1 ? parseInt(array[lastIdx]) : NaN
            if (!isNaN(version)) {
                array = array.slice(0, lastIdx)
            }
            return [array.join(':'), version]
        }

        bumpBtn {
            enabled: siteTag.text.length > 0
            onClicked: {
                let data = splitVersion(siteTag.text)
                data[1] = isNaN(data[1]) ? 1 : data[1] + 1
                siteTag.text = data.join(':')
                generateBtn.clicked()
            }
        }
        generateBtn {
            onClicked: {
                if (siteTag.text.length == 0) {
                    status.show(qsTr("Site tag should not be empty"), "gray")
                    return
                }
                if (!masterKey.text.length) {
                    status.show(qsTr("Master key should not be empty"),
                                "orange")
                    return
                }
                let hashText = WijjoPassHash.PassHashCommon.generateHashWord(
                        siteTag.text, masterKey.text,
                        parseInt(passwordLength.currentValue),
                        requireDigits.checked, requirePunctuation.checked,
                        requireMixedCase.checked, restrictNoSpecial.checked,
                        restrictDigitsOnly.checked)
                if (hashWord.text != hashText) {
                    hashWord.text = hashText
                    clipboard.text = hashText
                    status.show(qsTr("Password hash copied into clipboard"),
                                "green")
                }
            }
        }

        siteTag {
            onTextEdited: {
                hashWord.clear()
                let data = splitVersion(siteTag.text)
                if (isNaN(data[1])) {
                    // If no version, try to extract site tag from URL
                    if (siteTag.text == clipboard.text) {
                        // Only if pasted from clipboard
                        siteTag.text = qmlurl.siteTagFromUrl(data[0])
                        if (siteTag.text != data[0]) {
                            status.show(qsTr("Site tag extracted from URL"),
                                        "green")
                        }
                    }
                }
                siteTag.text = siteTag.text.toLocaleLowerCase()
            }
            onTextChanged: {
                if (siteTag.text.trim() != siteTag.text) {
                    status.show(qsTr("Site tag has spaces around"), "orange")
                }
            }
        }
        masterKey {
            onTextChanged: {
                hashWord.clear()
                if (masterKey.text.trim() != masterKey.text) {
                    status.show(qsTr("Master key has spaces around"), "orange")
                }
            }
        }

        requireDigits {
            checked: requirements.digits
            onCheckedChanged: generateBtn.clicked()
        }
        requirePunctuation {
            checked: requirements.punctuation
            onCheckedChanged: generateBtn.clicked()
        }
        requireMixedCase {
            checked: requirements.mixedCase
            onCheckedChanged: generateBtn.clicked()
        }
        restrictNoSpecial {
            checked: restrictions.noSpecial
            onCheckedChanged: generateBtn.clicked()
        }
        restrictDigitsOnly {
            checked: restrictions.digitsOnly
            onCheckedChanged: generateBtn.clicked()
        }
        passwordLength {
            currentIndex: passwordLength.model.findIndex(function (size) {
                return size === restrictions.passwordLength
            })
            onCurrentValueChanged: generateBtn.clicked()
        }
    }

    footer: Column {
        leftPadding: 5
        rightPadding: 5

        readonly property int childWidth: width - 10

        Label {
            // Label maintains status messages
            id: status
            text: "Status"
            opacity: 0.0
            width: parent.childWidth
            horizontalAlignment: Text.AlignHCenter

            function show(message, color) {
                if (statusTimer.running) {
                    statusTimer.stop()
                }
                if (statusOpacityAnim.running) {
                    statusOpacityAnim.stop()
                }
                status.text = message
                status.color = color
                status.opacity = 1.0
                statusTimer.start()
            }
            Timer {
                id: statusTimer
                interval: 1000
                repeat: false
                triggeredOnStart: false

                onTriggered: {
                    statusOpacityAnim.start()
                }
            }
            OpacityAnimator {
                id: statusOpacityAnim
                target: status
                from: 1.0
                to: 0.0
                duration: 500
            }
        }

        Button {
            text: qsTr("Save options")
            width: parent.childWidth

            onClicked: {
                requirements.digits = generatorPage.requireDigits.checked
                requirements.punctuation = generatorPage.requirePunctuation.checked
                requirements.mixedCase = generatorPage.requireMixedCase.checked
                restrictions.noSpecial = generatorPage.restrictNoSpecial.checked
                restrictions.digitsOnly = generatorPage.restrictDigitsOnly.checked
                restrictions.passwordLength = generatorPage.passwordLength.model[generatorPage.passwordLength.currentIndex]
            }
        }
    }
}
