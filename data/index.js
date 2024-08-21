import fs from 'fs'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    const payloadFiles = fs.readdirSync(__dirname, {recursive: true}).filter(dir => dir.endsWith('.txt'))
    for(let pf of payloadFiles) {
        let payloadName = pf.split('.')[0].replace(new RegExp('(\\\\)|(\/)'), "-")
        payloads[payloadName] = fs.readFileSync(__dirname + '\\' + pf, {encoding: 'ascii'}).split('\r\n').map(pl => buildRegExp(pl))
    }
    return payloads
}

const payloads = Object.entries(exportPayloads())

export {payloads}