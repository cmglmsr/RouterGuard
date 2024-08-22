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

    checkURL(url, regex) {
        return regex.test(url)
    }

    checkHeaders(headers, regex) {
        return traverse(headers, regex)
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
        this.log([`\n[+] Execution trace ${req.method} ${req.url}:`])
        const initialAuditResult = this.initialAudit(req)
        if(initialAuditResult) {
            return res.status(418).send(`This request was blocked: ${initialAuditResult}`)
        }
        if(!req.body) {
            return next()
        }
        try {
            var audits = []
            for(let attacks of payloads) {
                let attackName = attacks[0]
                let attackPatterns = attacks[1]
                for(const pattern of attackPatterns) {
                    if(this.checkURL(req.url, pattern)) {
                        audits.push({scope: 'url', attackName,  pattern})
                        this.log([`\t[***] ${attackName} attack pattern detected in URL:`, pattern])
                    }
                    if(this.checkHeaders(req.headers, pattern)) {
                        audits.push({scope: 'headers', attackName,  pattern})
                        this.log([`\t[***] ${attackName} attack pattern detected in Headers:`, pattern])
                    }
                    if(this.checkJsonBody(req.body, pattern)) {
                        audits.push({scope: 'json', attackName,  pattern})
                        this.log([`\t[***] ${attackName} attack pattern detected in JSON Body:`, pattern])
                    }
                    if(audits.length >= this.plevel) {
                        this.logSummary(audits, start, true, req)
                        return this.verbose ? res.status(418).send(`This request was blocked due to ${attackName} suspicion in JSON body for:\n\n${this.auditSummary(audits)}`) :
                            res.status(418).send('This request was blocked.')
                    }
                }
            }
            this.logSummary(audits, start, false, req)
            return next()
        } catch (e) {
            console.log(e)
        }
    }

    logSummary(audits, start, blocked, req) {
        const end = process.hrtime(start);
        const elapsedTime = (end[0] * 1000) + (end[1] / 1e6);
        if(blocked) {
            this.log([`\n[+] Audit Summary ${req.method} ${req.url}:\n\tRequest was blocked.\n\tNumber of detected patterns: ${audits.length}\n\tTime taken to audit the request: ${elapsedTime} ms\n`])
        } else {
            this.log([`\n[+] Audit Summary ${req.method} ${req.url}:\n\tRequest was allowed.\n\tNumber of detected patterns: ${audits.length}\n\tTime taken to audit the request: ${elapsedTime} ms`])
        }
        this.log([this.auditSummary(audits)])
    }

    auditSummary(audits) {
        let res = ''
        for(const audit of audits) {
            res += `\t${audit.attackName} suspicion in ${audit.scope} with attack pattern ${audit.pattern}.\n`
        }
        return res
    }

    log(args) {
        if(this.verbose) {
            console.log(...args)
        }
    }
}

export {rtguard}