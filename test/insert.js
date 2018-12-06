import test from 'zora';
import {insert, select} from '../dist/src';

test('insert builder: insert values as defined by value', t => {
    const actual = insert('foo', 'age')
        .values({'foo': 'bar', age: 4})
        .into('users')
        .build().text;
    const expected = 'INSERT INTO "users" ( "foo", "age" ) VALUES ( \'bar\', 4 )';
    t.equal(actual, expected);
});

test('insert builder: insert hash map value object', t => {
    const actual = insert({foo: 'bar', age: 4})
        .into('users')
        .build().text;
    const expected = 'INSERT INTO "users" ( "foo", "age" ) VALUES ( \'bar\', 4 )';
    t.equal(actual, expected);
});

test('insert builder: fill with default if not value is provided', t => {
    const actual = insert('foo', 'age', 'bar')
        .values({age: 4})
        .into('users')
        .build().text;

    const expected = 'INSERT INTO "users" ( "foo", "age", "bar" ) VALUES ( DEFAULT, 4, DEFAULT )';
    t.equal(actual, expected);
});

test('insert builder: bulk insert', t => {
    const actual = insert('foo', 'bar')
        .into('users')
        .values([{foo: 'foo1', bar: 1}, {foo: 'foo2', bar: 2}, {foo: 'foo3', bar: 3}])
        .build().text;

    const expected = `INSERT INTO "users" ( "foo", "bar" ) VALUES ( 'foo1', 1 ), ( 'foo2', 2 ), ( 'foo3', 3 )`;
    t.equal(actual, expected);
});

test('insert builder: use query params', t => {
    const actual = insert('foo', 'age')
        .into('users')
        .values({foo: '$foo', age: '$age'})
        .build({foo: 'foo', age: 'blah'});

    t.equal(actual.text, 'INSERT INTO "users" ( "foo", "age" ) VALUES ( $1, $2 )');
    t.deepEqual(actual.values, ['foo', 'blah']);
});

test('insert builder: WITH clause', t => {
    const subq = select()
        .from('users')
        .where('age', '>', 21)
        .orderBy('name')
        .limit(10);

    const actual = insert({foo: 'bar'})
        .into('blah')
        .with('s', subq)
        .build().text;

    const expected = `WITH "s" AS (SELECT * FROM "users" WHERE "age" > 21 ORDER BY "name" LIMIT 10) INSERT INTO "blah" ( "foo" ) VALUES ( 'bar' )`;

    t.equal(actual, expected);
});

test('insert builder: should be cloneable', t => {
    const builder1 = insert('foo', 'bar')
        .into('users')
        .values([{foo: 'foo1', bar: 1}, {foo: 'foo2', bar: 2}, {foo: 'foo3', bar: 3}])

    const builder2 = builder1.clone();

    builder2.values([{foo: 'foo4', bar: 4}]);

    const expected1 = `INSERT INTO "users" ( "foo", "bar" ) VALUES ( 'foo1', 1 ), ( 'foo2', 2 ), ( 'foo3', 3 )`;
    const expected2 = `INSERT INTO "users" ( "foo", "bar" ) VALUES ( 'foo1', 1 ), ( 'foo2', 2 ), ( 'foo3', 3 ), ( 'foo4', 4 )`;
    t.equal(builder1.build().text, expected1);
    t.equal(builder2.build().text, expected2);
});
