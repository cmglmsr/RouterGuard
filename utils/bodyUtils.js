export function traverse(value, regex) {
    if (Array.isArray(value)) {
        for (const element of value) {
            if (traverse(element, regex)) {
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

                if (traverse(val, regex)) {
                    return true;
                }
            }
        }
    } else {
        return regex.test(value)
    }
    return false;
}

export function traverseForm(value, regex) {
    if (Array.isArray(value)) {
        for (const element of value) {
            if (traverse(element, regex)) {
                return true;
            }
        }
    } else if (typeof value === 'object' && value !== null) {
        for (const key in value) {
            if (regex.test(key)) {
                return true;
            }

            const val = value[key];
            if (typeof val === 'string' && regex.test(val)) {
                return true;
            }

            if (traverse(val, regex)) {
                return true;
            }

        }
    } else {
        return regex.test(value)
    }
    return false;
}

export function compactObject(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.filter(Boolean).map(compactObject)
    let tempObj = {}
    for (let key in obj) {
        const value = compactObject(obj[key])
        if (Boolean(value)) tempObj[key] = value
    }
    return tempObj
}