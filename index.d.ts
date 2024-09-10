declare module '/data/index.js' {
    export const payloads: Array<[string, RegExp[]]>;
}

declare module '/utils/bodyUtils.js' {
    export function traverse(obj: object | string, regex: RegExp): boolean;
}

declare class rtguard {
    plevel: number;
    allowedBodyTypes: string[];
    allowedMethods: string[];
    maxRequestSize: number;
    verbose: boolean;

    constructor(config?: {
        plevel?: number;
        allowedBodyTypes?: string[];
        allowedMethods?: string[];
        maxRequestSize?: number;
        verbose?: boolean;
        multer?: Function;
    });

    initialAudit(req: { method: string; headers: { [key: string]: string } }): string | false;
    checkURL(url: string, regex: RegExp): boolean;
    checkHeaders(headers: object, regex: RegExp): boolean;
    checkJsonBody(body: object, regex: RegExp): string | boolean;
    rtguard(req: object, res: object, next: Function): void;
    logSummary(audits: object[], start: [number, number], blocked: boolean, req: object): void;
    auditSummary(audits: object[]): string;
    log(args: any[]): void;
}

type DynamicOption = string | string[] | (<Type>(arg: Type) => Type)

export { rtguard, DynamicOption };
