import {test} from 'zora';
import {select, update} from '../dist/src';

test('basic update', t => {
    const actual = update('users')
        .set('foo', 'bar')
        .set('woot', 4)
        .build().text;

    const expected = 'UPDATE "users" SET "foo" = \'bar\', "woot" = 4';
    t.equal(actual, expected);
});

test('support label on table', t => {
    const actual = update({value: 'users', as: 'u'})
        .set('u.foo', 'bar')
        .build().text;
    const expected = 'UPDATE "users" AS "u" SET "u"."foo" = \'bar\'';
    t.equal(actual, expected);
});

test('update with map value', t => {
    const actual = update('users')
        .set({
            foo: 'bar',
            woot: 4
        })
        .build().text;
    const expected = 'UPDATE "users" SET "foo" = \'bar\', "woot" = 4';
    t.equal(actual, expected);
});

test('update with where clause', t => {
    const actual = update('users')
        .set('foo', 'bar')
        .set('woot', 4)
        .where('foo', '<', 'bar')
        .and('woot', 6)
        .build().text;
    const expected = 'UPDATE "users" SET "foo" = \'bar\', "woot" = 4 WHERE "foo" < \'bar\' AND "woot" = 6';
    t.equal(actual, expected);
});

test('update with parameters', t => {
    const actual = update('users')
        .set('foo', '$bar')
        .set('woot', 4)
        .where('foo', '<', '$bim')
        .and('woot', '$woot')
        .build({bar: 'bar', bim: 'foo', woot: 7});
    const expected = 'UPDATE "users" SET "foo" = $1, "woot" = 4 WHERE "foo" < $2 AND "woot" = $3';
    t.equal(actual.text, expected);
    t.deepEqual(actual.values, ['bar', 'foo', 7]);
});

test('update with a from clause', t => {
    const expected = `UPDATE "employees" SET "sales_count" = 1000 FROM "accounts" WHERE "accounts"."name" = 'Acme Corporation' AND "employees"."id" = "accounts"."sales_person"`;
    const actual = update('employees')
        .set('sales_count', 1000)
        .from('accounts')
        .where('accounts.name', 'Acme Corporation')
        .and('employees.id', '"accounts"."sales_person"')
        .build()
        .text;

    t.equal(actual, expected);
});

test('update with a sub query', t => {
    const expected = `UPDATE "employees" SET "sales_count" = 1000 WHERE "id" = (SELECT "sales_person" FROM "accounts" WHERE "name" = 'Acme Corporation')`;

    const subQ = select('sales_person')
        .from('accounts')
        .where('name', 'Acme Corporation')
        .noop();

    const actual = update('employees')
        .set('sales_count', 1000)
        .where('id', subQ)
        .build()
        .text;

    t.equal(actual, expected);
});

test('update builder: WITH clause', t => {
    const subq = select()
        .from('users')
        .where('age', '>', 21)
        .orderBy('name')
        .limit(10);

    const actual = update('foo')
        .with('users', subq)
        .set('drunk', true)
        .build().text;

    const expected = `WITH "users" AS (SELECT * FROM "users" WHERE "age" > 21 ORDER BY "name" LIMIT 10) UPDATE "foo" SET "drunk" = true`;

    t.equal(actual, expected);
});

test('update builder: should be cloneable', t => {
    const subq = select()
        .from('users')
        .where('age', '>', 21)
        .orderBy('name')
        .limit(10);

    const main = update('foo')
        .with('users', subq)
        .set('drunk', true);

    const expected1 = `WITH "users" AS (SELECT * FROM "users" WHERE "age" > 21 ORDER BY "name" LIMIT 10) UPDATE "foo" SET "drunk" = true`;

    const clone = main.clone();
    clone.set('foo', 'bar');
    const expected2 = `WITH "users" AS (SELECT * FROM "users" WHERE "age" > 21 ORDER BY "name" LIMIT 10) UPDATE "foo" SET "drunk" = true, "foo" = 'bar'`;

    t.equal(main.build().text, expected1);
    t.equal(clone.build().text, expected2);
});
