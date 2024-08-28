import {payloads} from "./data/index.js";
import {traverse} from "./utils/bodyUtils.js";
import multer from "multer";
import bodyParser from "body-parser";

const upload = multer();

class rtguard {

    constructor(config) {
        this.plevel = config?.plevel || 4 // Paranioa level: threshold number of patterns needed to be detected before classifying the request as malicious
        this.allowedBodyTypes = config?.allowedBodyTypes || ['application/json']
        this.allowedMethods = config?.allowedMethods || ['GET', 'POST']
        this.maxRequestSize = config?.maxRequestSize || 4096
        this.verbose = !!config?.verbose
        this.action = config?.action || 'block' // Action to take when a malicious request is detected

        if(this.plevel > 10 || this.plevel < 1) {
            throw new Error('Illegal value: plevel must be in between 1-10.')
        }

        this.rtguard = this.rtguard.bind(this)
    }

    initialAudit(req) {
        if(this.allowedMethods?.length && !this.allowedMethods.includes(req.method)) {
            return 'Request method not allowed.'
        }
        if(this.allowedBodyTypes?.length && !this.allowedBodyTypes.includes('*') && req.headers['content-type']) {
            let found = false
            for(const bt of this.allowedBodyTypes) {
                if(req.headers['content-type'].includes(bt)) {
                    found = true
                }
            }
            if(!found) {
                return 'Request content type not allowed.'
            }
        }
        if(this.maxRequestSize && req.headers['content-length'] && parseInt(req.headers['content-length']) > this.maxRequestSize) {
            return 'Request exceeds maximum allowed size.'
        }
        return false
    }

    checkURL(url, regex) {
        return regex.test(url) || regex.test(decodeURIComponent(url))
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

    parseBody(req, res) {
        const contentType = (req.headers['content-type'] || '').trim();
        let parsedBody;

        if(!contentType || contentType.length === 0) {
            return null
        }

        return new Promise((resolve, reject) => {
            if (contentType.includes('application/json')) {
                bodyParser.json()(req, res, () => {
                    parsedBody = req.body;
                    resolve({body: parsedBody, type: 'application/json'})
                });
            } else if (contentType.includes('multipart/form-data')) {
                upload.any()(req, res, () => {
                    parsedBody = { files: req.files, fields: req.body };
                    resolve({body: parsedBody, type: 'multipart/form-data'})
                });
            } else if (contentType.includes('application/x-www-form-urlencoded')) {
                bodyParser.urlencoded({ extended: true })(req, res, () => {
                    parsedBody = req.body;
                    resolve({body: parsedBody, type: 'application/x-www-form-urlencoded'})
                });
            } else if (contentType.includes('text/plain')) {
                bodyParser.text()(req, res, () => {
                    parsedBody = req.body;
                    resolve({body: parsedBody, type: 'text/plain'})
                });
            } else if (contentType.includes('text/html')) {
                bodyParser.text({ type: 'text/html' })(req, res, () => {
                    parsedBody = req.body;
                    resolve({body: parsedBody, type: 'text/html'})
                });
            } else if (contentType.includes('text/javascript')) {
                bodyParser.text({ type: 'text/javascript' })(req, res, () => {
                    parsedBody = req.body;
                    resolve({body: parsedBody, type: 'text/javascript'})
                });
            } else if (contentType.includes('text/css')) {
                bodyParser.text({ type: 'text/css' })(req, res, () => {
                    parsedBody = req.body;
                    resolve({body: parsedBody, type: 'text/css'})
                });
            } else {
                reject('Unsupported media')
            }
        })
    };

    async rtguard(req, res, next) {
        const start = process.hrtime();
        this.log([`\n[+] Execution trace ${req.method} ${req.url}:`])
        const initialAuditResult = this.initialAudit(req)
        if(initialAuditResult) {
            this.logSummary(null, start, true, req)
            return res.status(418).send(`This request was blocked: ${initialAuditResult}`)
        }
        try {
            const parsedBody = await this.parseBody(req)
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
                    if(parsedBody.type) {
                        if(parsedBody.type === 'application/json' && this.checkJsonBody(parsedBody.body, pattern)) {
                            audits.push({scope: 'json', attackName,  pattern})
                            this.log([`\t[***] ${attackName} attack pattern detected in JSON Body:`, pattern])
                        } else if(parsedBody.type === 'multipart/form-data') {
                            console.log(parsedBody.body.fields)
                        } else if(parsedBody.type === 'application/x-www-form-urlencoded') {

                        } else if(parsedBody.type.includes('text')) {
                            this.log(['text'])
                        } else {

                        }
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
            next()
        }
    }

    logSummary(audits, start, blocked, req) {
        const end = process.hrtime(start);
        const elapsedTime = (end[0] * 1000) + (end[1] / 1e6);
        if(!audits) {
            this.log([`\n[+] Audit Summary ${req.method} ${req.url}:\n\tRequest was blocked at initial audit stage.\n\tNumber of detected patterns: N/A\n\tTime taken to audit the request: ${elapsedTime} ms\n`])
            return
        }
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