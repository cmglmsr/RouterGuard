import {payloads} from "./data/index.js";

class rtguard {

    constructor(config) {
        this.plevel = config?.plevel || 4
        this.allowedBodyTypes = config?.allowedBodyTypes || ['application/json']
        this.allowedMethods = config?.allowedMethods || ['GET', 'POST']
        this.maxRequestSize = config?.maxRequestSize || 4096
        this.verbose = config?.verbose

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

    checkJsonBody(body, regex) {
        try {
            JSON.parse(JSON.stringify(body))
        } catch (e) {
            return 'Invalid JSON.'
        }
        function traverse(value) {
            if (Array.isArray(value)) {
                for (const element of value) {
                    if (traverse(element)) {
                        return true;
                    }
                }
            } else if (typeof value === 'object' && value !== null) {
                for (const key in value) {
                    if (value.hasOwnProperty(key)) {
                        if (regex.test(key)) {
                            return true;
                        }

                        const val = value[key];
                        if (typeof val === 'string' && regex.test(val)) {
                            return true;
                        }

                        if (traverse(val)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        return traverse(body);
    }

    rtguard(req, res, next) {
        if(!req.body) {
            return next()
        }
        try {
            const initialAuditResult = this.initialAudit(req)
            if(initialAuditResult) {
                return res.status(418).send(`This request was blocked: ${initialAuditResult}`)
            }
            for(let attacks of payloads) {
                let attackName = attacks[0]
                let attackPatterns = attacks[1]
                for(const pattern of attackPatterns) {
                    const bodyAudit = this.checkJsonBody(req.body, pattern)
                    if(bodyAudit) {
                        console.log('Attack detected in JSON body', pattern)
                        return res.status(418).send(`This request was blocked due to ${attackName} suspicion in JSON body for ${pattern}.`)
                    }
                }
            }
            console.log('No attack detected')
            return next()
        } catch (e) {
            console.log(e)
        }
    }
}

export {rtguard}