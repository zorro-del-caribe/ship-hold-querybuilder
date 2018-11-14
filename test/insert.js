import test from 'zora';
import {insert, select} from '../dist/src';

test('insert builder: insert values as defined by value', t => {
    const actual = insert()
        .value('foo', 'bar')
        .value('age', 4)
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
    const actual = insert()
        .value('foo')
        .value('age', 4)
        .value('bar')
        .into('users')
        .build().text;

    const expected = 'INSERT INTO "users" ( "foo", "age", "bar" ) VALUES ( DEFAULT, 4, DEFAULT )';
    t.equal(actual, expected);
});

test('insert builder: use query params', t => {
    const actual = insert()
        .into('users')
        .value('foo', '$foo')
        .value('age', '$age')
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
