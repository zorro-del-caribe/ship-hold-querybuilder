import {test} from 'zora';
import {delete as del, select} from '../dist/src';

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
        .with('bars', subq)
        .where('bar', 'IN', '"bars"')
        .build().text;

    const expected = `WITH "bars" AS (SELECT * FROM "users" WHERE "age" > 21 ORDER BY "name" LIMIT 10) DELETE FROM "foo" WHERE "bar" IN "bars"`;

    t.equal(actual, expected);
});

test('delete should be cloneable', t => {
    const expected = `DELETE FROM "films" USING "producers" WHERE "producer_id" = "producers"."id" AND "producers"."name" = 'foo'`;

    const builder1 = del('films')
        .using('producers')
        .where('producer_id', '"producers"."id"')
        .and('producers.name', 'foo')
        .noop();

    const builder2 = builder1.clone().using('woot');

    t.equal(builder1.build().text, expected);
    t.equal(builder2.build().text, `DELETE FROM "films" USING "producers", "woot" WHERE "producer_id" = "producers"."id" AND "producers"."name" = 'foo'`);

});

test('delete with a returning clause', t => {
    const b = del('films')
        .using({value: select().from('films').where('rating', '<', 2).noop(), as: 'bad_movies'})
        .where('films.id', 'IN', select('id').from('bad_movies'))
        .returning('*')
        .build();

    t.equal(b.text, 'DELETE FROM "films" USING (SELECT * FROM "films" WHERE "rating" < 2) AS "bad_movies" WHERE "films"."id" IN (SELECT "id" FROM "bad_movies") RETURNING *');
});
