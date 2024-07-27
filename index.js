import {exportPayloads} from "./data/index.js";

const payloads = Object.entries(exportPayloads())

function rtguard(req, res, next) {
    if(!req.body) {
        return next()
    }
    try {
        for(let attacks of payloads) {
            let attackName = attacks[0]
            let attackPatterns = attacks[1]
            attackPatterns.forEach((pattern) => {
                if (pattern.test(req.body)) {
                    return res.status(418).send(`This request was blocked due to ${attackName} suspicion.`)
                }
            })
        }
        return next()
    } catch (e) {
        console.log(e)
    }
}

export default rtguard;