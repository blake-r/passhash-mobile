.pragma library
.import "utils-site-tag.js" as SiteTagUtils

const DATA = new Map()

const SETTING_CODES = new Map([['D', 'digits'], ['P', 'punctuation'], ['M', 'mixedCase'], ['S', 'special'], ['O', 'digitsOnly']])

function createKeepObj(siteTag, settings) {
    const keepObj = SiteTagUtils.createSiteObj(siteTag)
    keepObj.path = keepObj.tag.split('.')
    keepObj.settings = settings
    return keepObj
}

function parseKeeperLine(record) {
    // Example: "google DpMso8"
    const array = record.split(' ')
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

function initKeeperData(keeperTxt) {
    DATA.length = 0
    keeperTxt.split('\n').forEach(function (line) {
        line = line.trim()
        if (!line.length) {
            return
        }
        const keepObj = parseKeeperLine(line)
        DATA.set(keepObj.tag, keepObj)
    })
}

function findHints(siteObj) {
    const result = []
    const fullTag = siteObj.tag
    const parts = fullTag.split('.')
    // Show full match first
    findHintsForString(fullTag, result, function (part, str) {
        return part === str
    })
    // Show part matches second
    parts.forEach(function (part) {
        findHintsForString(part, result, function (part, str) {
            return part === str
        })
    })
    // Show partial part matches at the end
    parts.forEach(function (part) {
        findHintsForString(part, result, function (part, str) {
            return part.startsWith(str)
        })
    })
    return result
}

function findHintsForString(str, inoutHints, compFunc) {
    if (!str.length) {
        return
    }
    DATA.forEach(function (keepObj) {
        if (inoutHints.includes(keepObj)) {
            // Don't add a duplicate
            return
        }
        for (const j in keepObj.path) {
            const part = keepObj.path[j]
            if (compFunc(part, str)) {
                inoutHints.push(keepObj)
                break
            }
        }
    })
}

function storeSiteTag(siteTag, settings) {}
