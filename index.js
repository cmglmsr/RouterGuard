import {payloads} from "./data/index.js";
import {traverse} from "./utils/bodyUtils.js";

class rtguard {

    constructor(config) {
        this.plevel = config?.plevel || 4 // Paranioa level: threshold number of patterns needed to be detected before blocking the request
        this.allowedBodyTypes = config?.allowedBodyTypes || ['application/json']
        this.allowedMethods = config?.allowedMethods || ['GET', 'POST']
        this.maxRequestSize = config?.maxRequestSize || 4096
        this.verbose = !!config?.verbose

        if(this.plevel > 10 || this.plevel < 1) {
            throw new Error('Illegal value: plevel must be in between 1-10.')
        }

        this.rtguard = this.rtguard.bind(this)
    }

    initialAudit(req) {
        console.log(req.url)
        console.log(req.headers)
        if(this.allowedMethods?.length && !this.allowedMethods.includes(req.method)) {
            return 'Request method not allowed.'
        }
        if(this.allowedBodyTypes?.length && req.headers['content-type'] && !this.allowedBodyTypes.includes(req.headers['content-type'])) {
            return 'Request content type not allowed.'
        }
        if(this.maxRequestSize && req.headers['content-length'] && parseInt(req.headers['content-length']) > this.maxRequestSize) {
            return 'Request exceeds maximum allowed size.'
        }
        return false
    }

    checkJsonBody(body, regex) {
        try {
            JSON.parse(JSON.stringify(body))
        } catch (e) {
            return 'Invalid JSON.'
        }
        return traverse(body, regex);
    }

    rtguard(req, res, next) {
        const start = process.hrtime();
        const initialAuditResult = this.initialAudit(req)
        if(initialAuditResult) {
            return res.status(418).send(`This request was blocked: ${initialAuditResult}`)
        }
        if(!req.body) {
            return next()
        }
        try {
            for(let attacks of payloads) {
                let attackName = attacks[0]
                let attackPatterns = attacks[1]
                var bodyAudits = []
                for(const pattern of attackPatterns) {
                    if(this.checkJsonBody(req.body, pattern)) {
                        bodyAudits.push(pattern)
                        this.log(['[***] Attack pattern detected in JSON body:', pattern])
                    }
                    if(bodyAudits.length >= this.plevel) {
                        this.logSummary(bodyAudits, start, true)
                        return res.status(418).send(`This request was blocked due to ${attackName} suspicion in JSON body for ${bodyAudits.join(', ')}.`)
                    }
                }
            }
            this.logSummary(bodyAudits, start, false)
            return next()
        } catch (e) {
            console.log(e)
        }
    }

    logSummary(bodyAudits, start, blocked) {
        const end = process.hrtime(start);
        const elapsedTime = (end[0] * 1000) + (end[1] / 1e6);
        if(blocked) {
            this.log([`[+] Request blocked. \n\tNumber of detected patterns: ${bodyAudits.length}\n\tTime taken to audit the request: ${elapsedTime} ms`])
        } else {
            this.log([`[+] No attack detected in request. \n\tNumber of detected patterns: ${bodyAudits.length}\n\tTime taken to audit the request: ${elapsedTime} ms`])
        }
    }

    log(args) {
        if(this.verbose) {
            console.log(...args)
        }
    }
}

export {rtguard}