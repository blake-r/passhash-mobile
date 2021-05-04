import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12
import Qt.labs.settings 1.0
import ru.co_dev.passhash 3.0
import "utils-site-tag.js" as SiteTagUtils
import "utils-system.js" as SystemUtils
import "passhash-common.js" as WijjoPassHash

Page {
    default property KeeperPage keeper

    readonly property bool defaultConvertSiteTagLowerCase: true

    Connections {
        target: Qt.application
        function onStateChanged() {
            if (SystemUtils.needCleanupMasterKey()) {
                form.generator.masterKey.clear()
                status.show(qsTr("Application was invisible too long, clear master key value."),
                            "orange")
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

        Component.onCompleted: {
            form.settings.digits.checked = digits
            form.settings.punctuation.checked = punctuation
            form.settings.mixedCase.checked = mixedCase
        }
    }
    Settings {
        id: restrictions
        category: "Restrictions"
        property bool noSpecial: false
        property bool digitsOnly: false
        property int passwordLength: 8

        Component.onCompleted: {
            form.settings.noSpecial.checked = noSpecial
            form.settings.digitsOnly.checked = digitsOnly
            form.settings.length.currentIndex = form.settings.length.model.indexOf(
                        passwordLength)
        }
    }

    GeneratorPageForm {
        id: form
        anchors.fill: parent

        property var siteObj: SiteTagUtils.parseSiteInput('')

        generator.bumpBtn.onClicked: onBumpBtnClicked()
        generator.generateBtn.onClicked: onGenerateBtnClicked()
        generator.siteTag.onTextEdited: onSiteTagEdited()
        generator.masterKey.onTextEdited: onMasterKeyEdited()
        generator.hashWord.onTextChanged: onHashWordChanged()

        settings.digits.onToggled: generator.generateBtn.clicked()
        settings.punctuation.onToggled: generator.generateBtn.clicked()
        settings.mixedCase.onToggled: generator.generateBtn.clicked()
        settings.noSpecial.onToggled: generator.generateBtn.clicked()
        settings.digitsOnly.onToggled: generator.generateBtn.clicked()
        settings.length.onActivated: generator.generateBtn.clicked()

        hinter.delegate: Label {
            text: modelData.tag
            font.underline: modelData.tag === form.siteObj.tag

            MouseArea {
                anchors.fill: parent
                onClicked: form.onHinterClicked(modelData)
            }
        }

        function onBumpBtnClicked() {
            const siteObj = form.siteObj
            siteObj.ver = isNaN(siteObj.ver) ? 1 : siteObj.ver + 1
            generator.siteTag.text = SiteTagUtils.toString(siteObj)
            if (generator.masterKey.text.length > 0) {
                generator.generateBtn.clicked()
            }
        }
        function onGenerateBtnClicked() {
            let siteTagTxt = generator.siteTag.text
            if (!siteTagTxt.length) {
                status.show(qsTr("Site tag should not be empty"), "gray")
                return
            }
            let masterKeyTxt = generator.masterKey.text
            if (!masterKeyTxt.length) {
                status.show(qsTr("Master key should not be empty"), "orange")
                return
            }

            if (defaultConvertSiteTagLowerCase) {
                siteTagTxt = siteTagTxt.toLocaleLowerCase()
            }

            const hashText = WijjoPassHash.PassHashCommon.generateHashWord(
                               siteTagTxt, masterKeyTxt,
                               parseInt(settings.length.currentValue),
                               settings.digits.checked,
                               settings.punctuation.checked,
                               settings.mixedCase.checked,
                               settings.noSpecial.checked,
                               settings.digitsOnly.checked)
            generator.hashWord.text = hashText
        }
        function onSiteTagEdited() {
            generator.hashWord.clear()
            const siteObj = SiteTagUtils.parseSiteInput(generator.siteTag.text)
            if (isNaN(siteObj.ver)) {
                // If no version, try to extract site tag from URL
                if (siteObj.tag.startsWith("http://") || siteObj.tag.startsWith(
                            "https://")) {
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
                            status.show(qsTr("Site tag extracted from URL"),
                                        "green")
                        }
                    }
                }
            }

            const text = SiteTagUtils.toString(siteObj)
            if (text.trim() !== text) {
                status.show(qsTr("Site tag has spaces around"), "orange")
            }
            generator.siteTag.text = text
            form.siteObj = siteObj

            hinter.model = keeper.findHints(siteObj)
        }
        function onMasterKeyEdited() {
            generator.hashWord.clear()
            const masterKeyTxt = generator.masterKey.text
            if (masterKeyTxt.trim() !== masterKeyTxt) {
                status.show(qsTr("Master key has spaces around"), "orange")
            }
        }
        function onHashWordChanged() {
            clipboard.text = generator.hashWord.text
            status.show(qsTr("Password hash copied into clipboard"), "green")
        }
        function onHinterClicked(keepObj) {
            generator.siteTag.text = SiteTagUtils.toString(keepObj)
            settings.digits.checked = keepObj.settings.digits
            settings.punctuation.checked = keepObj.settings.punctuation
            settings.mixedCase.checked = keepObj.settings.mixedCase
            settings.noSpecial.checked = keepObj.settings.noSpecial
            settings.digitsOnly.checked = keepObj.settings.digisOnly
            hinter.model = []
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
                requirements.digits = form.settings.digits.checked
                requirements.punctuation = form.settings.punctuation.checked
                requirements.mixedCase = form.settings.mixedCase.checked
                restrictions.noSpecial = form.settings.noSpecial.checked
                restrictions.digitsOnly = form.settings.digitsOnly.checked
                restrictions.passwordLength
                        = form.settings.length.model[form.settings.length.currentIndex]
                status.show(qsTr("Settings are saved"), "green")
            }
        }
    }
}
