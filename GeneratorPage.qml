import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12
import Qt.labs.settings 1.0
import ru.co_dev.passhash 3.0
import "utils-site-tag.js" as SiteTagUtils
import "passhash-common.js" as WijjoPassHash

Page {
    default property KeeperPage keeper

    readonly property int defaultMasterKeyClearTimeout: 30000
    readonly property bool defaultConvertSiteTagLowerCase: true

    property double masterKeyClearTime: 0

    Connections {
        target: Qt.application
        function onStateChanged() {
            if (Qt.application.state === Qt.ApplicationSuspended) {
                masterKeyClearTime = Date.now() + defaultMasterKeyClearTimeout
            } else if (Qt.application.state === Qt.ApplicationActive) {
                if (masterKeyClearTime > 0) {
                    if (Date.now() >= masterKeyClearTime) {
                        form.masterKey.clear()
                        status.show(qsTr("Application was invisible too long, clear master key value."),
                                    "orange")
                    }
                    masterKeyClearTime = 0
                }
            }
        }
    }

    QmlUrl {
        id: qmlUrl
    }
    QmlClipboard {
        id: clipboard
    }

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

    GeneratorPageForm {
        id: form
        anchors.fill: parent

        function splitVersion(siteTag) {
            return
        }

        bumpBtn {
            enabled: siteTag.text.length > 0
            onClicked: {
                const siteObj = SiteTagUtils.parseSiteInput(siteTag.text)
                siteObj.ver = isNaN(siteObj.ver) ? 1 : siteObj.ver + 1
                siteTag.text = [siteObj.tag, siteObj.ver].join(':')
                generateBtn.clicked()
            }
        }
        generateBtn {
            onClicked: {
                let siteTagTxt = siteTag.text
                if (siteTagTxt.length == 0) {
                    status.show(qsTr("Site tag should not be empty"), "gray")
                    return
                }
                let masterKeyTxt = masterKey.text
                if (!masterKeyTxt.length) {
                    status.show(qsTr("Master key should not be empty"),
                                "orange")
                    return
                }

                if (defaultConvertSiteTagLowerCase) {
                    siteTagTxt = siteTagTxt.toLocaleLowerCase()
                }

                keeper.read(siteTagTxt)

                let hashText = WijjoPassHash.PassHashCommon.generateHashWord(
                        siteTagTxt, masterKeyTxt,
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

                keeper.write(siteTagTxt, requirements, restrictions)
            }
        }

        siteTag {
            onTextEdited: {
                hashWord.clear()
                const siteObj = SiteTagUtils.parseSiteInput(siteTag.text)
                if (isNaN(siteObj.ver)) {
                    // If no version, try to extract site tag from URL
                    if (siteObj.tag.startsWith("http://")
                            || siteObj.tag.startsWith("https://")) {
                        qmlUrl.url = siteObj.tag
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
                                array = array.slice(startIdx, endIdx)
                                siteObj.tag = array.join('.')
                                status.show(qsTr(
                                                "Site tag extracted from URL"),
                                            "green")
                            }
                        }
                    }
                }
                const text = SiteTagUtils.toString(siteObj)
                if (text.trim() != text) {
                    status.show(qsTr("Site tag has spaces around"), "orange")
                }
                siteTag.text = text

                hinter.model = keeper.findHints(siteObj)
            }
        }
        masterKey {
            onTextEdited: {
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

        hinter {
            delegate: Label {
                text: modelData.tag

                MouseArea {
                    anchors.fill: parent
                    onClicked: {
                        form.siteTag.text = SiteTagUtils.toString(modelData)
                        form.hinter.model = []
                    }
                }
            }
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
                requirements.digits = form.requireDigits.checked
                requirements.punctuation = form.requirePunctuation.checked
                requirements.mixedCase = form.requireMixedCase.checked
                restrictions.noSpecial = form.restrictNoSpecial.checked
                restrictions.digitsOnly = form.restrictDigitsOnly.checked
                restrictions.passwordLength
                        = form.passwordLength.model[form.passwordLength.currentIndex]
                status.show(qsTr("Settings are saved"), "green")
            }
        }
    }
}
