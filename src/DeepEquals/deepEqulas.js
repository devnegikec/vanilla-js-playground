function deepEqual(a, b) {
    const visitedA = new WeakMap();
    const visitedB = new WeakMap();

    return _internalDeepEqual(a, b, visitedA, visitedB);
}
function _internalDeepEqual(a, b, visitedA, visitedB) {
    // Handle NaN case first, as NaN !== NaN
    if (Number.isNaN(a) && Number.isNaN(b)) {
        return true;
    }

    // 1. Check for strict equality (handles primitives and same object reference)
    if (a === b) {
        return true;
    }

    // 2. Check if either is not an object or is null (must be done after === check)
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
        return false;
    }

    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }

    if (a instanceof RegExp && b instanceof RegExp) {
        return a.toString() === b.toString();
    }

    if (a instanceof Set && b instanceof Set) {
        if (a.size !== b.size) {
            return false;
        }

        const bItems = Array.from(b);
        for (const itemA of a) {
            const foundMatch = bItems.some(itemB => _internalDeepEqual(itemA, itemB, visitedA, visitedB));
            if (!foundMatch) {
                return false;
            }
        }
        return true;
    }

    if (a instanceof Map && b instanceof Map) {
        if (a.size !== b.size) {
            return false;
        }

        for (const [key, value] of a) {
            if (!b.has(key) || !_internalDeepEqual(value, b.get(key), visitedA, visitedB)) {
                return false;
            }
        }
        return true;
    }

    // 3. Handle circular references
    // If we've already compared this pair of objects, we have a cycle.
    if (visitedA.has(a) && visitedA.get(a) === b) {
        return true;
    }
    if (visitedB.has(b) && visitedB.get(b) === a) {
        return true;
    }

    // Mark these objects as seen
    visitedA.set(a, b);
    visitedB.set(b, a);

    // 4. If one is an array and the other is not, they are not equal
    if (Array.isArray(a) !== Array.isArray(b)) {
        return false;
    }

    // // 5. Get the keys of both objects/arrays
    // const keysA = Object.keys(a);
    // const keysB = Object.keys(b);

    // // 6. Check if they have the same number of keys/elements
    // if (keysA.length !== keysB.length) {
    //     return false;
    // }

    // // 7. Check if all keys/elements and their values are equal recursively
    // for (const key of keysA) {
    //     if (!keysB.includes(key) || !_internalDeepEqual(a[key], b[key], visitedA, visitedB)) {
    //         return false;
    //     }
    // }

    const keysA = Reflect.ownKeys(a);
    const keysB = Reflect.ownKeys(b);

    // 7. Check if they have the same number of keys/elements
    if (keysA.length !== keysB.length) {
        return false;
    }

    // 8. Check if all keys/elements and their values are equal recursively
    for (const key of keysA) {
        // We need to check if the key exists in the other object
        if (!Reflect.ownKeys(b).includes(key) || !_internalDeepEqual(a[key], b[key], visitedA, visitedB)) {
            return false;
        }
    }

    // 8. If all checks pass, the items are deeply equal
    return true;
}

export default deepEqual;

