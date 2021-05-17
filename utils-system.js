.pragma library

var MASTER_KEY_CLEAR_TIMEOUT = 30000
let masterKeyClearTime = 0

function needCleanupMasterKey() {
    let result = false
    if (Qt.application.state === Qt.ApplicationSuspended) {
        masterKeyClearTime = Date.now() + MASTER_KEY_CLEAR_TIMEOUT
    } else if (Qt.application.state === Qt.ApplicationActive) {
        if (masterKeyClearTime > 0) {
            if (Date.now() >= masterKeyClearTime) {
                result = true
            }
            masterKeyClearTime = 0
        }
    }
    return result
}
