// Test utils

const testBlock = (name: string) => {
    console.groupEnd();
    console.group(`# ${name}\n`);
};

const areEqual = (a: any, b: any): boolean => {
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((element, index) => element === b[index]);
    }

    return a === b;
};

const test = (whatWeTest: string, actualResult: any, expectedResult: string | boolean | Array<any>): void => {
    if (areEqual(actualResult, expectedResult)) {
        console.log(`[OK] ${whatWeTest}\n`);
    } else {
        console.error(`[FAIL] ${whatWeTest}`);
        console.debug('Expected:');
        console.debug(expectedResult);
        console.debug('Actual:');
        console.debug(actualResult);
        console.log('');
    }
};

// Functions

const getType = (value: any): string => typeof value;

const getTypesOfItems = (arr: Array<any>): Array<string> => arr.map((element) => getType(element));

const allItemsHaveTheSameType = (arr: Array<any>): boolean => {
    if (arr.length && arr.length > 1) {
        const firstType = getType(arr[0]);
        return arr.every((element) => getType(element) === firstType);
    }
    return true;
};

const getRealType = (value: any): string => {
    if (typeof value === 'number') {
        if (isNaN(value)) {
            return 'nan';
        }
        if (!isFinite(value)) {
            return 'infinity';
        }
        return 'number';
    }

    return Object.prototype.toString.call(value).split(' ')[1].slice(0, -1).toLowerCase();
};

const getRealTypesOfItems = (arr) => arr.map((element) => getRealType(element));

const everyItemHasAUniqueRealType = (arr) => {
    const itemsType = getRealTypesOfItems(arr);
    const collection = new Set(itemsType);

    return itemsType.length === collection.size;
};

const countRealTypes = (arr) => {
    const result = {};

    arr.forEach((element) => {
        if (!result[getRealType(element)]) {
            result[getRealType(element)] = 0;
        }
        result[getRealType(element)] += 1;
    });

    return Object.entries(
        Object.keys(result)
            .sort()
            .reduce((accumulator, key) => {
                accumulator[key] = result[key];

                return accumulator;
            }, {})
    );
};

// Tests

testBlock('getType');

test('Boolean', getType(true), 'boolean');
test('Number', getType(123), 'number');
test('String', getType('whoo'), 'string');
test('Array', getType([]), 'object');
test('Object', getType({}), 'object');
test(
    'Function',
    getType(() => {}),
    'function'
);
test('Undefined', getType(undefined), 'undefined');
test('Null', getType(null), 'object');

testBlock('allItemsHaveTheSameType');

test('All values are numbers', allItemsHaveTheSameType([11, 12, 13]), true);

test('All values are strings', allItemsHaveTheSameType(['11', '12', '13']), true);

test('All values are strings but wait', allItemsHaveTheSameType(['11', new String('12'), '13']), false);

// @ts-expect-error: https://github.com/microsoft/TypeScript/issues/27910
test('Values like a number', allItemsHaveTheSameType([123, 123 / 'a', 1 / 0]), true);

test(
    'Values like an object',
    allItemsHaveTheSameType([
        {},
        // eslint-disable-next-line no-array-constructor
        new Array(),
        new Boolean(),
        new Date(),
        new Number(),
        // eslint-disable-next-line no-new-object
        new Object(),
        new RegExp(''),
        new Set(),
        new String(),
        null,
        [],
        new Promise((resolve) => {
            resolve('res');
        }),
        // eslint-disable-next-line no-restricted-syntax
        new WeakSet(),
        new ArrayBuffer(2),
        new DataView(new ArrayBuffer(2)),
        // eslint-disable-next-line no-restricted-syntax
        new Int8Array(),
        // eslint-disable-next-line no-restricted-syntax
        new Int16Array(),
        // eslint-disable-next-line no-restricted-syntax
        new Float32Array(),
        new Map(),
    ]),
    true
);

testBlock('getTypesOfItems VS getRealTypesOfItems');

const knownTypes = [
    [],
    BigInt(9007199254740991),
    true,
    new Date(),
    () => {},
    Infinity,
    NaN,
    null,
    123,
    {},
    new RegExp(''),
    new Set(),
    Symbol('symbol'),
    'string',
    undefined,
    async () => true,
    new Promise((resolve) => {
        resolve('res');
    }),
    // eslint-disable-next-line no-restricted-syntax
    new WeakSet(),
    new ArrayBuffer(2),
    new DataView(new ArrayBuffer(2)),
    // eslint-disable-next-line no-restricted-syntax
    new Int8Array(),
    // eslint-disable-next-line no-restricted-syntax
    new Int16Array(),
    // eslint-disable-next-line no-restricted-syntax
    new Float32Array(),
    new Map(),
];

test('Check basic types', getTypesOfItems(knownTypes), [
    'object',
    'bigint',
    'boolean',
    'object',
    'function',
    'number',
    'number',
    'object',
    'number',
    'object',
    'object',
    'object',
    'symbol',
    'string',
    'undefined',
    'function',
    'object',
    'object',
    'object',
    'object',
    'object',
    'object',
    'object',
    'object',
]);

test('Check real types', getRealTypesOfItems(knownTypes), [
    'array',
    'bigint',
    'boolean',
    'date',
    'function',
    'infinity',
    'nan',
    'null',
    'number',
    'object',
    'regexp',
    'set',
    'symbol',
    'string',
    'undefined',
    'asyncfunction',
    'promise',
    'weakset',
    'arraybuffer',
    'dataview',
    'int8array',
    'int16array',
    'float32array',
    'map',
]);

testBlock('everyItemHasAUniqueRealType');

test('All value types in the array are unique', everyItemHasAUniqueRealType([true, 123, '123']), true);

// @ts-expect-error: https://github.com/microsoft/TypeScript/issues/27910
test('Two values have the same type', everyItemHasAUniqueRealType([true, 123, '123' === 123]), false);

test('There are no repeated types in knownTypes', everyItemHasAUniqueRealType(knownTypes), true);

testBlock('countRealTypes');

test('Count unique types of array items', countRealTypes([true, null, !null, !!null, {}]), [
    ['boolean', 3],
    ['null', 1],
    ['object', 1],
]);

test('Counted unique types are sorted', countRealTypes([{}, null, true, !null, !!null]), [
    ['boolean', 3],
    ['null', 1],
    ['object', 1],
]);

testBlock('Additional tests');

test('Check empty arrays', [], []);
test('BigInt type', getType(BigInt(10n)), 'bigint');
test('Date type', getType(new Date()), 'object');
test('Infinity type', getType(Infinity), 'number');
test('RegExp type', getType(new RegExp('')), 'object');
test('Set type', getType(new Set()), 'object');
test('Symbol type', getType(Symbol('symbol')), 'symbol');
test('String String() type', getType(String('whoo')), 'string');
test('String toStrong() type', getType('string'.toString()), 'string');
test('Infinity realType', getRealType(1 / 0), 'infinity');
// @ts-expect-error: https://github.com/microsoft/TypeScript/issues/27910
test('Infinity realType', getRealType(1 / 'string'), 'nan');
test('Infinity realType', getRealType(Infinity / 0), 'infinity');
