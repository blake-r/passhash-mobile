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
                        generatorPage.masterKey.clear()
                        status.show(qsTr("Application was invisible too long, clear master key value."),
                                    "orange")
                    }
                    masterKeyClearTime = 0
                }
            }
        }
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
        font.bold: true
    }

    StackLayout {
        id: stack
        anchors.fill: parent
        currentIndex: tabs.currentIndex

        Page {
            ComposeForm {
                id: generatorPage

                function splitVersion(siteTag) {
                    let array = siteTag.split(':')
                    let lastIdx = array.length - 1
                    let version = array.length > 1 ? parseInt(
                                                         array[lastIdx]) : NaN
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
                        let siteTagTxt = siteTag.text
                        if (siteTagTxt.length == 0) {
                            status.show(qsTr("Site tag should not be empty"),
                                        "gray")
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

                        let hashText = WijjoPassHash.PassHashCommon.generateHashWord(
                                siteTagTxt, masterKeyTxt,
                                parseInt(passwordLength.currentValue),
                                requireDigits.checked,
                                requirePunctuation.checked,
                                requireMixedCase.checked,
                                restrictNoSpecial.checked,
                                restrictDigitsOnly.checked)
                        if (hashWord.text != hashText) {
                            hashWord.text = hashText
                            clipboard.text = hashText
                            status.show(qsTr("Password hash copied into clipboard"),
                                        "green")
                        } else {
                            status.show(qsTr('Password hash has not changed'),
                                        "gray")
                        }
                    }
                }

                siteTag {
                    onTextEdited: {
                        hashWord.clear()
                        let data = splitVersion(siteTag.text)
                        if (isNaN(data[1])) {
                            // If no version, try to extract site tag from URL
                            if (data[0].startsWith("http://")
                                    || data[0].startsWith("https://")) {
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
                                        siteTag.text = array.slice(
                                                    startIdx, endIdx).join('.')
                                        status.show(qsTr("Site tag extracted from URL"),
                                                    "green")
                                    }
                                }
                            }
                        }
                        if (siteTag.text.trim() != siteTag.text) {
                            status.show(qsTr("Site tag has spaces around"),
                                        "orange")
                        }
                    }
                }
                masterKey {
                    onTextEdited: {
                        hashWord.clear()
                        if (masterKey.text.trim() != masterKey.text) {
                            status.show(qsTr("Master key has spaces around"),
                                        "orange")
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
                    currentIndex: passwordLength.model.findIndex(
                                      function (size) {
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

        Page {
            padding: 6
            bottomPadding: 0

            Frame {
                anchors.fill: parent
                padding: 0

                ScrollView {
                    anchors.fill: parent
                    ScrollBar.horizontal.policy: ScrollBar.AlwaysOff

                    TextArea {
                        id: keeper
                        readOnly: true
                        wrapMode: TextEdit.Wrap
                        text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,"
                    }
                }
            }

            footer: RowLayout {
                spacing: 0

                Button {
                    text: qsTr("Export")
                    Layout.fillWidth: true
                    Layout.margins: 6
                }
                Button {
                    text: qsTr("Import")
                    Layout.fillWidth: true
                    Layout.margins: 6
                }
            }
        }
    }

    footer: TabBar {
        id: tabs
        width: parent.width

        TabButton {
            text: qsTr("Generator")
        }
        TabButton {
            text: qsTr("Keeper")
        }
    }
}
