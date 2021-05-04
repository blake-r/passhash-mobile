.pragma library
.import "utils-site-tag.js" as SiteTagUtils

function parseKeeperLine(input) {
    const array = input.split(' ')
    const settings = array.length > 1 ? array.pop() : ''
    const siteObj = SiteTagUtils.parseSiteInput(array.join(' '))
    siteObj.path = siteObj.tag.split('.')
    siteObj.settings = parseKeeperSettings(settings)
    return siteObj
}

function parseKeeperSettings(str) {
    console.warn('parseKeeperSettings() not implemented yet:', str)
}

function parseKeeperText(input) {
    let result = []
    input.split('\n').forEach(function (line) {
        result.push(parseKeeperLine(line))
    })
    return result
}
