import fs from 'fs'

function buildRegExp(str) {
    const specialChars = /[.*+?^${}()|[\]\\]/g;
    try {
        const escapedStr = str.replace(specialChars, '\\$&');
        return new RegExp(escapedStr);
    } catch (e) {}
}

/**
 * Generates payloads based on the provided txt files in 'data' directory.
 * @returns {{}}
 */
function exportPayloads() {
    let payloads = {}
    const payloadFiles = fs.readdirSync('.', {recursive: true}).filter(dir => dir.endsWith('.txt'))
    for(let pf of payloadFiles) {
        let payloadName = pf.split('.')[0].replace(new RegExp('(\\\\)|(\/)'), "-")
        payloads[payloadName] = fs.readFileSync(pf, {encoding: 'ascii'}).split('\r\n').map(pl => buildRegExp(pl))
    }
    return payloads
}
export {exportPayloads}