.pragma library
.import "utils-site-tag.js" as SiteTagUtils

var DATA = []

const SETTING_CODES = new Map([['D', 'digits'], ['P', 'punctuation'], ['M', 'mixedCase'], ['S', 'special'], ['O', 'digitsOnly']])

function parseKeeperLine(input) {
    // Example: "google DpMso8"
    const array = input.split(' ')
    const settings = array.length > 1 ? array.pop() : ''
    const siteObj = SiteTagUtils.parseSiteInput(array.join(' '))
    siteObj.path = siteObj.tag.split('.')
    siteObj.settings = parseKeeperSettings(settings)
    return siteObj
}

function parseKeeperSettings(input) {
    const result = {}
    SETTING_CODES.forEach(function (kv) {
        result[kv] = null
    })
    let length = 0
    for (const i in input) {
        const char = input[i]
        const charUpper = char.toUpperCase()
        const key = SETTING_CODES.get(charUpper)
        if (key === undefined) {
            if (char >= '0' && char <= '9') {
                length = length * 10 + parseInt(char)
            }
        } else {
            result[key] = (char === charUpper)
        }
    }
    length -= length % 2 // Hash word length should be aligned to 2
    result.length = length > 0 ? length : null
    return result
}

function parseKeeperText(input) {
    let result = []
    input.split('\n').forEach(function (line) {
        result.push(parseKeeperLine(line))
    })
    return result
}

function findHints(siteObj) {
    const parts = siteObj.tag.split('.')
    const result = []
    for (const i in parts) {
        const part = parts[i]
        if (part.length) {
            findHintsForString(part, result)
        }
    }
    return result
}

function findHintsForString(input, inoutHints) {
    for (const i in DATA) {
        const keepObj = DATA[i]
        if (inoutHints.includes(keepObj)) {
            continue
        }
        for (const j in keepObj.path) {
            const part = keepObj.path[j]
            if (part.startsWith(input)) {
                inoutHints.push(keepObj)
                break
            }
        }
    }
}
