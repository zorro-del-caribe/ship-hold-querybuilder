import test from 'zora';
import select from '../dist/src/builders/select';

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
