.pragma library
.import "utils-site-tag.js" as SiteTagUtils

const DATA = new Map()

const SETTING_CODES = new Map([['D', 'digits'], ['P', 'punctuation'], ['M', 'mixedCase'], ['S', 'special'], ['O', 'digitsOnly']])
let changeData

function createKeepObj(siteTag, settings) {
    const keepObj = SiteTagUtils.createSiteObj(siteTag)
    keepObj.tag = keepObj.tag
    keepObj.path = keepObj.tag.split('.')
    keepObj.settings = settings
    return keepObj
}

function initKeeperData(changeDataFunc) {
    changeData = changeDataFunc
}

function updateKeeperData(keeperTxt) {
    DATA.clear()
    keeperTxt.split('\n').forEach(function (line) {
        line = line.trim()
        if (!line.length) {
            return
        }
        const keepObj = parseKeeperRecord(line)
        DATA.set(keepObj.tag, keepObj)
    })
}

function storeSiteTag(siteTag, settings) {
    const keepObj = createKeepObj(siteTag, settings)
    DATA.set(keepObj.tag, keepObj)
    changeData(makeKeeperText())
}

function parseKeeperRecord(record) {
    // Example: "google DpMso8"
    const array = record.split('=')
    const settingsString = array.length > 1 ? array.pop() : ''
    const settings = parseKeeperSettings(settingsString)
    return createKeepObj(array.join(' '), settings)
}

function parseKeeperSettings(str) {
    const result = {}
    SETTING_CODES.forEach(function (value) {
        result[value] = null
    })
    let length = 0
    for (const i in str) {
        const char = str[i]
        const charUpper = char.toUpperCase()
        const key = SETTING_CODES.get(charUpper)
        if (key === undefined) {
            if (char >= '0' && char <= '9') {
                length = length * 10 + parseInt(char)
            } else {
                console.warn('Symbol "' + char + '" is not a setting code')
            }
        } else {
            result[key] = (char === charUpper)
        }
    }
    length -= length % 2 // Hash word length should be aligned to 2
    result.length = length > 0 ? length : null
    return result
}

function makeKeeperText() {
    const result = []
    DATA.forEach(function (keepObj) {
        const siteTag = SiteTagUtils.toString(keepObj)
        const settingsString = makeSettingsText(keepObj.settings)
        const record = [siteTag, settingsString].join('=')
        result.push(record)
    })
    result.sort()
    return result.join('\n')
}

function makeSettingsText(settings) {
    const result = []
    SETTING_CODES.forEach(function (key, char) {
        const value = ifnull(settings[key], null)
        if (value !== null) {
            result.push(value ? char : char.toLowerCase())
        }
    })
    if (typeof settings.length === 'number') {
        result.push(settings.length.toString())
    }
    return result.join('')
}

function ifnull(value, defval) {
    if (value === null || value === undefined) {
        return defval
    }
    return value
}
