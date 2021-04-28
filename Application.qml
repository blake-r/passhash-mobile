import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12
import Qt.labs.settings 1.0
import ru.co_dev.passhash 3.0
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
        id: qmlUrl
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
                        siteTag.text.toLocaleLowerCase(), masterKey.text,
                        parseInt(passwordLength.currentValue),
                        requireDigits.checked, requirePunctuation.checked,
                        requireMixedCase.checked, restrictNoSpecial.checked,
                        restrictDigitsOnly.checked)
                if (hashWord.text != hashText) {
                    hashWord.text = hashText
                    clipboard.text = hashText
                    status.show(qsTr("Password hash copied into clipboard"),
                                "green")
                } else {
                    status.show(qsTr('Password hash has not changed'), "gray")
                }
            }
        }

        siteTag {
            onTextEdited: {
                hashWord.clear()
                let data = splitVersion(siteTag.text)
                if (isNaN(data[1])) {
                    // If no version, try to extract site tag from URL
                    if (data[0].startsWith("http://") || data[0].startsWith(
                                "https://")) {
                        qmlUrl.url = data[0]
                        if (qmlUrl.isValid) {
                            let array = qmlUrl.host.split('.')
                            let startIdx = 0
                            let endIdx = array.length
                            if (array[0] === 'www') {
                                // www.google.com -> google.com
                                ++startIdx
                            }
                            if (startIdx < endIdx) {
                                // google.com -> google
                                --endIdx
                            }
                            if (startIdx < endIdx) {
                                siteTag.text = array.slice(startIdx,
                                                           endIdx).join('.')
                                status.show(qsTr(
                                                "Site tag extracted from URL"),
                                            "green")
                            }
                        }
                    }
                }
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
            onToggled: generateBtn.clicked()
        }
        requirePunctuation {
            checked: requirements.punctuation
            onToggled: generateBtn.clicked()
        }
        requireMixedCase {
            checked: requirements.mixedCase
            onToggled: generateBtn.clicked()
        }
        restrictNoSpecial {
            checked: restrictions.noSpecial
            onToggled: generateBtn.clicked()
        }
        restrictDigitsOnly {
            checked: restrictions.digitsOnly
            onToggled: generateBtn.clicked()
        }
        passwordLength {
            currentIndex: passwordLength.model.findIndex(function (size) {
                return size === restrictions.passwordLength
            })
            onActivated: generateBtn.clicked()
        }
    }

    footer: ColumnLayout {
        width: parent.width

        StatusLabel {
            id: status
            horizontalAlignment: Text.AlignHCenter
            Layout.fillWidth: true
            Layout.margins: 6
            Layout.bottomMargin: 0
        }

        Button {
            text: qsTr("Save settings")
            Layout.fillWidth: true
            Layout.margins: 6
            Layout.topMargin: 0

            onClicked: {
                requirements.digits = generatorPage.requireDigits.checked
                requirements.punctuation = generatorPage.requirePunctuation.checked
                requirements.mixedCase = generatorPage.requireMixedCase.checked
                restrictions.noSpecial = generatorPage.restrictNoSpecial.checked
                restrictions.digitsOnly = generatorPage.restrictDigitsOnly.checked
                restrictions.passwordLength = generatorPage.passwordLength.model[generatorPage.passwordLength.currentIndex]
                status.show(qsTr("Settings are saved"), "green")
            }
        }
    }
}
