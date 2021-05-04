.pragma library

function toString(siteObj) {
    if (isNaN(siteObj.ver))
        return siteObj.tag
    else
        return siteObj.tag + ':' + siteObj.ver
}

function SiteObject(tag, ver) {
    this.tag = tag
    this.ver = ver
}

function parseSiteInput(input) {
    const array = input.split(':')
    const lastIdx = array.length - 1
    const version = lastIdx > 0 ? parseInt(array[lastIdx]) : NaN
    let tag
    if (!isNaN(version)) {
        array.pop()
        tag = array.join(':')
    } else {
        tag = input
    }
    return new SiteObject(tag, version)
}
