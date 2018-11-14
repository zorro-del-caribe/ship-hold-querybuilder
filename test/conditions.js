import test from 'zora';
import {condition, select} from '../dist/src';

test('condition builder: use provided operator', t => {
    const actual = condition()
        .if('foo', '<=', 'bar')
        .build().text;
    const expected = '"foo" <= \'bar\'';
    t.equal(actual, expected);
});

test('condition builder: use default operator', t => {
    const actual = condition()
        .if('foo', 'bar')
        .build().text;
    const expected = '"foo" = \'bar\'';
    t.equal(actual, expected);
});

test('condition builder: combine conditions', t => {
    const actual = condition()
        .if('foo', '<=', 'bar')
        .and('blah.what', 'woot')
        .or('age', '<=', 66)
        .build().text;
    const expected = '"foo" <= \'bar\' AND "blah"."what" = \'woot\' OR "age" <= 66';
    t.equal(actual, expected);
});

test('condition builder: combine conditions with params', t => {
    const actual = condition()
        .if('foo', '<=', '$bar')
        .and('blah.what', '$what')
        .or('age', '<=', '$age')
        .build({bar: 'barval', what: 'whatval', age: 4});
    t.equal(actual.text, '"foo" <= $1 AND "blah"."what" = $2 OR "age" <= $3');
    t.deepEqual(actual.values, ['barval', 'whatval', 4]);
});

test('condition builder: use subquery', t => {
    const subq = condition()
        .if('foo', 'bar')
        .and('bar', '>', 4);

    const actual = condition()
        .if('wat', 'blah')
        .or(subq)
        .build().text;

    const expected = '"wat" = \'blah\' OR ("foo" = \'bar\' AND "bar" > 4)';
    t.equal(actual, expected);
});

test('condition builder: sub query with params', t => {
    const subq = condition()
        .if('foo', 'bar')
        .and('bar', '>', '$bar');

    const actual = condition()
        .if('wat', '$wat')
        .or(subq)
        .build({bar: 4, wat: 'blah'});

    const expected = '"wat" = $1 OR ("foo" = \'bar\' AND "bar" > $2)';
    t.equal(actual.text, expected);
    t.deepEqual(actual.values, ['blah', 4]);
});

test('condition builder: support object as json', t => {
    const actual = condition()
        .if('jsondoc', '@>', {foo: 'bar'})
        .build();

    const expected = '"jsondoc" @> \'{"foo":"bar"}\'';

    t.equal(actual.text, expected);
});

test('condition builder: support subquery as operand', t => {
    const selection = select('*').from('bim');

    const actual = condition()
        .if('foo', 'IN', selection)
        .build();

    const expected = `"foo" IN (SELECT * FROM "bim")`;

    t.equal(actual.text, expected);
});

test('condition builder: support subquery as operand with parameters', t => {
    const selection = select('*')
        .from('bim')
        .limit('$limit');

    const actual = condition()
        .if('foo', 'IN', selection)
        .and('wat', '$wat')
        .build({limit: 10, wat: 42});

    const expected = `"foo" IN (SELECT * FROM "bim" LIMIT $1) AND "wat" = $2`;

    t.equal(actual.text, expected);
    t.deepEqual(actual.values, [10, 42]);
});

test('condition builder: support multiple sub queries with parameters as operands', t=>{
    const selection = select()
        .from('bim')
        .limit('$limit');

    const selection2 = select()
        .from('blah')
        .limit('$limitBis');

    const actual = condition()
        .if('foo', 'IN', selection)
        .and('foo','NOT IN',selection2 )
        .build({limit: 10, limitBis: 6});

    const expected = `"foo" IN (SELECT * FROM "bim" LIMIT $1) AND "foo" NOT IN (SELECT * FROM "blah" LIMIT $2)`;

    t.equal(actual.text, expected);
    t.deepEqual(actual.values, [10, 6]);
});

