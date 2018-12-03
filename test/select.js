import test from 'zora';
import {select} from '../dist/src';

test('select builder: select given columns from a table', t => {
    const actual = select('foo', 'bar')
        .from('users')
        .build()
        .text;

    const expected = 'SELECT "foo", "bar" FROM "users"';
    t.equal(actual, expected);
});

test('select builder: select all columns if no argument is provided', t => {
    const actual = select()
        .from('users')
        .build()
        .text;
    const expected = 'SELECT * FROM "users"';
    t.equal(actual, expected);
});

test('select builder: use column labels', t => {
    const actual =
        select('bar', {value: 'foo', as: 'labeledFoo'})
            .from('users')
            .build()
            .text;
    const expected = 'SELECT "bar", "foo" AS "labeledFoo" FROM "users"';
    t.equal(actual, expected);
});

test('select builder: support subquery in the select clause without alias', t => {
    const sq = select().from('blah');
    const actual = select('foo', sq)
        .from('bim')
        .build().text;

    t.equal(actual, 'SELECT "foo", (SELECT * FROM "blah") FROM "bim"');
});

test('select builder: support subquery in the select clause with alias', t => {
    const sq = select().from('blah');
    const actual = select('foo', {value: sq, as: 'blah'})
        .from('bim')
        .build().text;

    t.equal(actual, 'SELECT "foo", (SELECT * FROM "blah") AS "blah" FROM "bim"');
});

test('select builder: support subquery in the select clause with parameters', t => {
    const sq = select().from('blah').where('param', '$param1').noop();
    const actual = select('foo', {value: sq, as: 'blah'})
        .from('bim')
        .where('params2', '$param2')
        .build({
            param1: 'value1',
            param2: 'value2'
        });

    t.equal(actual.text, 'SELECT "foo", (SELECT * FROM "blah" WHERE "param" = $1) AS "blah" FROM "bim" WHERE "params2" = $2');
    t.deepEqual(actual.values, ['value1', 'value2']);
});

test('select builder: use table labels', t => {
    const actual = select('foo')
        .from({value: 'users', as: 'u'})
        .build()
        .text;
    const expected = 'SELECT "foo" FROM "users" AS "u"';
    t.equal(actual, expected);
});

test('select builder: use sub query for table', t => {
    const sub = select('foo')
        .from('bar');

    const actual = select()
        .from({value: sub, as: 'label'})
        .build()
        .text;

    const expected = 'SELECT * FROM (SELECT "foo" FROM "bar") AS "label"';
    t.equal(actual, expected);
});

test('select builder: involve more than one table', t => {
    const actual = select('foo', 'bar')
        .from('users', {value: 'product', as: 'p'})
        .build().text;
    const expected = 'SELECT "foo", "bar" FROM "users", "product" AS "p"';
    t.equal(actual, expected);
});

test('select builder: understand dot notation', t => {
    const actual = select('users.foo', {value: 'users.bar', as: 'bar'})
        .from('users')
        .build()
        .text;
    const expected = 'SELECT "users"."foo", "users"."bar" AS "bar" FROM "users"';
    t.equal(actual, expected);
});

test('select builder: where: use provided operator', t => {
    const actual = select()
        .from('users')
        .where('foo', '>', 12)
        .build()
        .text;
    const expected = 'SELECT * FROM "users" WHERE "foo" > 12';
    t.equal(actual, expected);
});

test('select builder: where: use default operator', t => {
    const actual = select()
        .from('users')
        .where('foo', 12)
        .build()
        .text;
    const expected = 'SELECT * FROM "users" WHERE "foo" = 12';
    t.equal(actual, expected);
});

test('select builder: where: add clauses with AND logical operator', t => {
    const actual = select('name', 'age')
        .from('users')
        .where('foo', 'blah')
        .and('age', '>=', 4)
        .and('blah', 'wat')
        .build()
        .text;
    const expected = 'SELECT "name", "age" FROM "users" WHERE "foo" = \'blah\' AND "age" >= 4 AND "blah" = \'wat\'';
    t.equal(actual, expected);
});

test('select builder: where: use OR clause', t => {
    const actual = select('name', 'age')
        .from('users')
        .where('foo', 'blah')
        .or('age', '>=', 4)
        .build()
        .text;
    const expected = 'SELECT "name", "age" FROM "users" WHERE "foo" = \'blah\' OR "age" >= 4';
    t.equal(actual, expected);
});

test('select builder: order by: no direction provided', t => {
    const actual = select()
        .from('users')
        .orderBy('foo')
        .build()
        .text;
    const expected = 'SELECT * FROM "users" ORDER BY "foo"';
    t.equal(actual, expected);
});

test('select builder: order by: direction provided', t => {
    const actual = select()
        .from('users')
        .orderBy('foo', 'asc')
        .where('foo', 'bar')
        .build()
        .text;

    const expected = 'SELECT * FROM "users" WHERE "foo" = \'bar\' ORDER BY "foo" ASC';
    t.equal(actual, expected);
});

test('select builder: order by: multiple properties', t => {
    const actual = select()
        .from('users')
        .orderBy('foo', 'asc')
        .orderBy('bar', 'desc')
        .build()
        .text;

    const expected = 'SELECT * FROM "users" ORDER BY "foo" ASC, "bar" DESC';
    t.equal(actual, expected);
});

test('select builder: limit with no offset', t => {
    const actual = select()
        .from('users')
        .limit(4)
        .build()
        .text;
    const expected = 'SELECT * FROM "users" LIMIT 4';
    t.equal(actual, expected);
});

test('select builder: limit with offset', t => {
    const actual = select()
        .from('users')
        .limit(4, 5)
        .build()
        .text;
    const expected = 'SELECT * FROM "users" LIMIT 4 OFFSET 5';
    t.equal(actual, expected);
});

test('select builder: support query parameters', t => {
    const actual = select()
        .from('users')
        .where('foo', '$foo')
        .and('blah', '$blah')
        .build({foo: 'bar', blah: 4});

    t.equal(actual.text, 'SELECT * FROM "users" WHERE "foo" = $1 AND "blah" = $2');
    t.deepEqual(actual.values, ['bar', 4]);
});

test('select builder: inner join', t => {
    const actual = select()
        .from('users')
        .join('products')
        .on('users.id', '"products"."id"')
        .and('users.id', '=', 4)
        .build();

    t.equal(actual.text, 'SELECT * FROM "users" JOIN "products" ON "users"."id" = "products"."id" AND "users"."id" = 4');
});

test('select builder: join with subquery', t => {

    const sq = select().from('products');

    const actual = select()
        .from('users')
        .join(sq)
        .on('users.id', '"products"."id"')
        .and('users.id', '=', 4)
        .build();

    t.equal(actual.text, 'SELECT * FROM "users" JOIN (SELECT * FROM "products") ON "users"."id" = "products"."id" AND "users"."id" = 4');
});

test('select builder: join with params', t => {
    const actual = select()
        .from('users')
        .leftJoin('products')
        .on('users.id', '"products"."id"')
        .and('users.id', '$userId')
        .where('users.age', '$age')
        .build({age: 5, userId: 666});
    const expected = 'SELECT * FROM "users" LEFT JOIN "products" ON "users"."id" = "products"."id" AND "users"."id" = $1 WHERE "users"."age" = $2';
    t.equal(actual.text, expected);
    t.deepEqual(actual.values, [666, 5]);
});

test('select builder: combine joins', t => {
    const actual = select()
        .from('users')
        .rightJoin('products')
        .on('users.id', '"products"."userId"')
        .fullJoin('addresses')
        .on('users.id', '"addresses"."userId"')
        .build().text;
    const expected = 'SELECT * FROM "users" RIGHT JOIN "products" ON "users"."id" = "products"."userId" FULL JOIN "addresses" ON "users"."id" = "addresses"."userId"';
    t.equal(actual, expected);
});

test('select builder: WITH clause', t => {
    const subq = select()
        .from('users')
        .where('age', '>', 21)
        .orderBy('name')
        .limit(10);

    const actual = select()
        .with('majors', subq)
        .from('majors')
        .leftJoin('drinking_tastes')
        .on('majors.id', '=', '"drinking_tastes"."user_id"')
        .build().text;

    const expected = `WITH "majors" AS (SELECT * FROM "users" WHERE "age" > 21 ORDER BY "name" LIMIT 10) SELECT * FROM "majors" LEFT JOIN "drinking_tastes" ON "majors"."id" = "drinking_tastes"."user_id"`;

    t.equal(actual, expected);
});

test('select builder: with multiple WITH clause', t => {
    const subq = select()
        .from('users')
        .where('age', '>', 21)
        .orderBy('name')
        .limit(10);

    const subq2 = select()
        .from('drinking_tastes')
        .where('user_id', '"majors"."id"');

    const actual = select()
        .with('majors', subq)
        .with('drinks', subq2)
        .from('majors')
        .leftJoin('drinks')
        .on('majors.id', '=', '"drinks"."user_id"')
        .build().text;

    const expected = `WITH "majors" AS (SELECT * FROM "users" WHERE "age" > 21 ORDER BY "name" LIMIT 10), "drinks" AS (SELECT * FROM "drinking_tastes" WHERE "user_id" = "majors"."id") SELECT * FROM "majors" LEFT JOIN "drinks" ON "majors"."id" = "drinks"."user_id"`;

    t.equal(actual, expected);
});

test('select builder: WITH clause with parameters', t => {
    const subq = select()
        .from('users')
        .where('age', '>', '$age')
        .orderBy('name')
        .limit(10);

    const subq2 = select()
        .from('drinking_tastes')
        .where('user_id', '"majors"."id"')
        .and('degree', '>', '$degree');

    const actual = select()
        .with('majors', subq)
        .with('drinks', subq2)
        .from('majors')
        .leftJoin('drinks')
        .on('majors.id', '=', '"drinks"."user_id"')
        .build({age: 21, degree: 42});

    const expected = `WITH "majors" AS (SELECT * FROM "users" WHERE "age" > $1 ORDER BY "name" LIMIT 10), "drinks" AS (SELECT * FROM "drinking_tastes" WHERE "user_id" = "majors"."id" AND "degree" > $2) SELECT * FROM "majors" LEFT JOIN "drinks" ON "majors"."id" = "drinks"."user_id"`;
    t.equal(actual.text, expected);
    t.deepEqual(actual.values, [21, 42]);
});

test('select builder should be cloneable', t => {
    const s1 = select('foo', {value: 'bar', as: 'woot'})
        .from('users')
        .where('age', '>', 20)
        .orderBy('age');

    const s2 = s1.clone();

    s2.limit(10);

    t.equal(s1.build().text, `SELECT "foo", "bar" AS "woot" FROM "users" WHERE "age" > 20 ORDER BY "age"`);
    t.equal(s2.build().text, `SELECT "foo", "bar" AS "woot" FROM "users" WHERE "age" > 20 ORDER BY "age" LIMIT 10`);
});

test('select builder: group by clause single column', t => {
    const q = select('foo', 'bar').from('woo').groupBy('foo').build();
    t.equal(q.text, `SELECT "foo", "bar" FROM "woo" GROUP BY "foo"`);
});

test('select builder: group by clause with multiple columns', t => {
    const q = select('foo', 'bar').from('woo').groupBy('foo', 'bar.bim', 'woot').build();
    t.equal(q.text, `SELECT "foo", "bar" FROM "woo" GROUP BY "foo", "bar"."bim", "woot"`);
});

test('select builder: group by clause with having clause', t => {
    const q = select('foo', 'bar')
        .from('woo')
        .groupBy('foo')
        .having('foo', '>', 4)
        .and('bim', 'in', select('id').from('blah'))
        .build();
    t.equal(q.text, `SELECT "foo", "bar" FROM "woo" GROUP BY "foo" HAVING "foo" > 4 AND "bim" in (SELECT "id" FROM "blah")`);
});
