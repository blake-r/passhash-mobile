.pragma library
.import "utils-site-tag.js" as SiteTagUtils

function parseKeeperLine(input) {
    const array = input.split(' ')
    const settings = array.length > 1 ? array.pop() : ''
    const siteObj = SiteTagUtils.parseSiteInput(array.join(' '))
    siteObj.path = siteObj.tag.split('.')
    siteObj.settings = settings
    return siteObj
}

function parseKeeperText(input) {
    let result = []
    input.split('\n').forEach(function (line) {
        result.push(parseKeeperLine(line))
    })
    return result
}
