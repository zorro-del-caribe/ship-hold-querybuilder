import test from 'zora';
import {delete as del, insert, select} from '../dist/src';

test('basic delete', t => {
    const actual = del('users')
        .build().text;
    const expected = 'DELETE FROM "users"';
    t.equal(actual, expected);
});

test('delete with where clause', t => {
    const actual = del('users')
        .where('foo', '<', 'bar')
        .and('woot', 6)
        .build().text;
    const expected = 'DELETE FROM "users" WHERE "foo" < \'bar\' AND "woot" = 6';
    t.equal(actual, expected);
});

test('delete with parameters', t => {
    const actual = del('users')
        .where('foo', '<', '$bar')
        .and('woot', '$woot')
        .build({bar: 'foo', woot: 'bar'});
    const expected = 'DELETE FROM "users" WHERE "foo" < $1 AND "woot" = $2';
    t.equal(actual.text, expected);
    t.deepEqual(actual.values, ['foo', 'bar']);
});

test('delete with the using clauses', t => {
    const expected = `DELETE FROM "films" USING "producers" WHERE "producer_id" = "producers"."id" AND "producers"."name" = 'foo'`;

    const actual = del('films')
        .using('producers')
        .where('producer_id', '"producers"."id"')
        .and('producers.name', 'foo')
        .build()
        .text;

    t.equal(expected, actual);
});

test('delete builder: WITH clause', t => {
    const subq = select()
        .from('users')
        .where('age', '>', 21)
        .orderBy('name')
        .limit(10);

    const actual = del('foo')
        .with('bars',subq)
        .where('bar','IN','"bars"')
        .build().text;

    const expected = `WITH "bars" AS (SELECT * FROM "users" WHERE "age" > 21 ORDER BY "name" LIMIT 10) DELETE FROM "foo" WHERE "bar" IN "bars"`;

    t.equal(actual, expected);
});
