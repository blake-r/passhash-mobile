.pragma library

function toString(siteObj) {
    if (isNaN(siteObj.ver))
        return siteObj.tag
    return [siteObj.tag, siteObj.ver].join(':')
}

function createSiteObj(siteTag) {
    const array = siteTag.toLocaleLowerCase().split(':')
    const lastIdx = array.length - 1
    const version = lastIdx > 0 ? parseInt(array[lastIdx]) : NaN
    let tag
    if (!isNaN(version)) {
        array.pop()
        tag = array.join(':')
    } else {
        tag = siteTag
    }
    return {
        "tag": tag,
        "ver": version
    }
}
