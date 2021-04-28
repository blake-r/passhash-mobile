import QtQuick 2.12
import QtQuick.Controls 2.12

Label {
    text: "StatusLabel"
    opacity: 0.0

    function show(message, color) {
        if (statusTimer.running) {
            statusTimer.stop()
        }
        if (statusOpacityAnim.running) {
            statusOpacityAnim.stop()
        }
        status.text = message
        status.color = (typeof color !== 'undefined' ? color : "white")
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
