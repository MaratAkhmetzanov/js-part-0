// Test utils

const testBlock = (name) => {
    console.groupEnd();
    console.group(`# ${name}\n`);
};

const areEqual = (a, b) => {
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length ? JSON.stringify(a) === JSON.stringify(b) : false;
    }

    return a === b;
};

const test = (whatWeTest, actualResult, expectedResult) => {
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

const getType = (value) => typeof value;

const getTypesOfItems = (arr) => arr.map((element) => getType(element));

const allItemsHaveTheSameType = (arr) => {
    if (arr.length && arr.length > 1) {
        for (let index = 1; index < arr.length; index++) {
            if (getType(arr[index]) !== getType(arr[0])) {
                return false;
            }
        }
    }
    return true;
};

const getRealType = (value) => {
    if (getType(value) === 'number') {
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
    const result = [];

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
        new RegExp(),
        new Set(),
        new String(),
        null,
        [],
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
    new RegExp(),
    new Set(),
    Symbol('symbol'),
    'string',
    undefined,
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
]);

testBlock('everyItemHasAUniqueRealType');

test('All value types in the array are unique', everyItemHasAUniqueRealType([true, 123, '123']), true);

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
