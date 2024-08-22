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
