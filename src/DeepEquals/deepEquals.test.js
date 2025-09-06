import deepEqual from "./deepEqulas";

describe('deepEqual', () => {
    test('should return true for two equal primitive numbers', () => {
        expect(deepEqual(5, 5)).toBe(true);
    });

    test('should return true for two simple objects with the same properties', () => {
        const obj1 = { a: 1, b: 'hello' };
        const obj2 = { a: 1, b: 'hello' };
        expect(deepEqual(obj1, obj2)).toBe(true);
    });

    test('should return false for two objects with different properties', () => {
        const obj1 = { a: 1, b: 'hello' };
        const obj2 = { a: 1, b: 'world' };
        expect(deepEqual(obj1, obj2)).toBe(false);
    });

    test('should return true for two equal nested objects', () => {
        const obj1 = { a: 1, b: { c: 3 } };
        const obj2 = { a: 1, b: { c: 3 } };
        expect(deepEqual(obj1, obj2)).toBe(true);
    });

    test('should return true for two equal arrays', () => {
        const arr1 = [1, 2, { a: 3 }];
        const arr2 = [1, 2, { a: 3 }];
        expect(deepEqual(arr1, arr2)).toBe(true);
    });

    test('should return false when comparing an array to an object with the same keys', () => {
        const arr = [1, 2, 3];
        const obj = { '0': 1, '1': 2, '2': 3 };
        expect(deepEqual(arr, obj)).toBe(false);
    });

    test('should return true for two NaN values', () => {
        expect(deepEqual(NaN, NaN)).toBe(true);
    });

    // Test 6: Circular References
    test('should handle circular references without an infinite loop', () => {
        const obj1 = {};
        obj1.a = obj1; // obj1 references itself

        const obj2 = {};
        obj2.a = obj2; // obj2 references itself

        const obj3 = { a: {} }; // A non-circular object

        expect(deepEqual(obj1, obj2)).toBe(true); // Should be true
        expect(deepEqual(obj1, obj3)).toBe(false); // Should be false
    });

    test('should return true for two equal Date objects', () => {
        const date1 = new Date('2025-09-06T12:00:00Z');
        const date2 = new Date('2025-09-06T12:00:00Z');
        expect(deepEqual(date1, date2)).toBe(true);
    });

    test('should return false for two different Date objects', () => {
        const date1 = new Date('2025-09-06T12:00:00Z');
        const date2 = new Date('2024-01-01T00:00:00Z');
        expect(deepEqual(date1, date2)).toBe(false);
    });

    test('should return true for two equal RegExp objects', () => {
        const regex1 = /hello/gi;
        const regex2 = /hello/gi;
        expect(deepEqual(regex1, regex2)).toBe(true);
    });

    test('should return false for two different RegExp objects', () => {
        const regex1 = /hello/gi;
        const regex2 = /world/gi;
        expect(deepEqual(regex1, regex2)).toBe(false);
    });

    test('should return false for two RegExp objects with different flags', () => {
        const regex1 = /hello/gi;
        const regex2 = /hello/g;
        expect(deepEqual(regex1, regex2)).toBe(false);
    });

    test('should return true for two equal Set objects', () => {
        const set1 = new Set([1, 2, 3]);
        const set2 = new Set([1, 2, 3]);
        expect(deepEqual(set1, set2)).toBe(true);
    });

    test('should return false for two different Set objects', () => {
        const set1 = new Set([1, 2, 3]);
        const set2 = new Set([3, 4, 5]);
        expect(deepEqual(set1, set2)).toBe(false);
    });

    test('should return true for sets with the same values but different order', () => {
        // Sets are unordered, so their logical content is the same.
        const set1 = new Set([1, 2, 3]);
        const set2 = new Set([3, 1, 2]);
        expect(deepEqual(set1, set2)).toBe(true);
    });

    test('should return true for two equal Map objects', () => {
        const map1 = new Map([['a', 1], ['b', { c: 2 }]]);
        const map2 = new Map([['a', 1], ['b', { c: 2 }]]);
        expect(deepEqual(map1, map2)).toBe(true);
    });

    test('should return false for two different Map objects', () => {
        const map1 = new Map([['a', 1], ['b', 2]]);
        const map2 = new Map([['a', 1], ['c', 3]]);
        expect(deepEqual(map1, map2)).toBe(false);
    });
    
    test('should return true for two equal Map objects with different insertion order', () => {
        const map1 = new Map([['a', 1], ['b', 2]]);
        const map2 = new Map([['b', 2], ['a', 1]]);
        expect(deepEqual(map1, map2)).toBe(true);
    });

    test('should return false for an object with a symbol key and an empty object', () => {
        const sym = Symbol('id');
        const obj1 = { [sym]: 1 };
        const obj2 = {};
        expect(deepEqual(obj1, obj2)).toBe(false);
    });

    test('should return true for two objects with the same symbol key and value', () => {
        const sym = Symbol('id');
        const obj1 = { [sym]: 1, a: 2 };
        const obj2 = { [sym]: 1, a: 2 };
        expect(deepEqual(obj1, obj2)).toBe(true);
    });

    test('should return false for two objects with the same symbol key but different values', () => {
        const sym = Symbol('id');
        const obj1 = { [sym]: 1 };
        const obj2 = { [sym]: 2 };
        expect(deepEqual(obj1, obj2)).toBe(false);
    });
});

