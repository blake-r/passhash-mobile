.pragma library
.import "utils-keeper.js" as KeeperUtils

function findHints(siteObj) {
    const result = []
    const fullTag = siteObj.tag
    const parts = fullTag.split('.')
    // Show full match first
    findHintsForString(fullTag, result, compareExact)
    // Show part matches second
    parts.forEach(function (part) {
        findHintsForString(part, result, compareExact)
    })
    // Show partial part matches at the end
    parts.forEach(function (part) {
        findHintsForString(part, result, comparePartial)
    })
    return result
}

function findHintsForString(str, inoutHints, compFunc) {
    if (!str.length) {
        return
    }
    KeeperUtils.DATA.forEach(function (keepObj) {
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

function compareExact(part, str) {
    return part === str
}

function comparePartial(part, str) {
    return part.startsWith(str)
}
