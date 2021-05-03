.pragma library


/* Parses "Site tag" value.
  Returns an object:
  - text
  - tag
  - ver
 */
function parseSiteInput(input) {
    const array = input.split(':')
    const lastIdx = array.length - 1
    const version = lastIdx >= 0 ? parseInt(array[lastIdx]) : NaN
    if (!isNaN(version)) {
        array.pop()
    }
    return {
        "text": input,
        "tag": array.join(':'),
        "ver": version
    }
}
