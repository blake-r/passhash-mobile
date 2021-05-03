.pragma library
.import "site-tag-utils.js" as SiteTagUtils


/* Parses single "Keeper" line.
  Returns an object:
  - text
  - tag
  - ver
  - path
  - settings
 */
function parseKeeperLine(input) {
    const array = input.split(' ', 1)
    const siteObj = SiteTagUtils.parseSiteInput(array[0])
    siteObj['path'] = siteObj['tag'].split('.')
    siteObj['settings'] = array[1]
    return siteObj
}


/* Parses "Keeper" data.
  Returns an array of keeper line parsed results.
 */
function parseKeeperText(input) {
    let result = []
    input.split('\n').forEach(function (line) {
        result.push(parseKeeperLine(line))
    })
    return result
}
