import fs from 'fs'
import { fileURLToPath } from 'url';
import { dirname, join  } from 'path';

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
    let payloads = {};
    const payloadFiles = fs.readdirSync(__dirname, { recursive: true }).filter(dir => dir.endsWith('.txt'));
    for (let pf of payloadFiles) {
        let payloadName = pf.split('.')[0].replace(/[/\\]/g, "-");  // Replace both forward and backslashes
        payloads[payloadName] = fs.readFileSync(join(__dirname, pf), { encoding: 'ascii' })
            .split('\r\n')
            .map(pl => buildRegExp(pl));
    }
    return payloads;
}

/**
 * Groups payloads in single regular expressions.
 * @returns []
 */
function groupPayloads(payloads) {
    let res = {}
    for(const entry of payloads) {
        const attackType = entry[0]
        const attackPatterns = entry[1]
        let combinedPattern = new RegExp()
        console.log(attackType)
        for(const pattern of attackPatterns) {
            console.log(pattern)
            combinedPattern = new RegExp(combinedPattern.source + "|" + pattern.source);
        }
        res[attackType] = combinedPattern
    }
    return res
}

const payloads = Object.entries(exportPayloads())

export {payloads}