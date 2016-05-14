const test = require('tape');
const select = require('../select');
const operators = require('../lib/opreators');

test('select given columns from a table', t=> {
  const actual =
    select('foo', 'bar')
      .from('users')
      .build();
  const expected = 'SELECT "foo", "bar" FROM "users"';
  t.equal(actual, expected);
  t.end();
});

test('select all columns if no argument is provided', t=> {
  const actual = select()
    .from('users')
    .build();
  const expected = 'SELECT * FROM "users"';
  t.equal(actual, expected);
  t.end();
});

test('use column labels', t=> {
  const actual =
    select('bar', {value: 'foo', as: 'labeledFoo'})
      .from('users')
      .build();
  const expected = 'SELECT "bar", "foo" AS "labeledFoo" FROM "users"';
  t.equal(actual, expected);
  t.end();
});

test('use table labels', t=> {
  const actual = select('foo')
    .from({value: 'users', as: 'u'})
    .build();
  const expected = 'SELECT "foo" FROM "users" AS "u"';
  t.equal(actual, expected);
  t.end();
});

test('involve more than one table', t=> {
  const actual = select('foo', 'bar')
    .from('users', {value: 'product', as: 'p'})
    .build();
  const expected = 'SELECT "foo", "bar" FROM "users", "product" AS "p"';
  t.equal(actual, expected);
  t.end();
});

test('understand dot notation', t=> {
  const actual = select('users.foo', {value: 'users.bar', as: 'bar'})
    .from('users')
    .build();
  const expected = 'SELECT "users"."foo", "users"."bar" AS "bar" FROM "users"';
  t.equal(actual, expected);
  t.end();
});

test('where: use provided operator', t=> {
  const actual = select()
    .from('users')
    .where('foo', operators.GREATER, 12)
    .build();
  const expected = 'SELECT * FROM "users" WHERE "foo">\'12\'';
  t.equal(actual, expected);
  t.end();
});

test('where: use default operator', t=> {
  const actual = select()
    .from('users')
    .where('foo', 12)
    .build();
  const expected = 'SELECT * FROM "users" WHERE "foo"=\'12\'';
  t.equal(actual, expected);
  t.end();
});

/*
 test('where: both operand as pointer', t=> {
 const actual = q()
 .select()
 .from('users')
 .where('foo', 'users.bar')
 .build();
 const expected = 'SELECT * FROM "users" WHERE "foo"="users"."bar"';
 t.equal(actual, expected);
 t.end();
 });
 */

test('where: add clauses with AND logical operator', t=> {
  const actual = select('name', 'age')
    .from('users')
    .where('foo', 'blah')
    .and('age', '>=', 4)
    .and('blah','wat')
    .build();
  const expected = 'SELECT "name", "age" FROM "users" WHERE "foo"=\'blah\' AND "age">=\'4\' AND "blah"=\'wat\'';
  t.equal(actual, expected);
  t.end();
});

test('where: use OR clause', t=> {
  const actual = select('name', 'age')
    .from('users')
    .where('foo', 'blah')
    .or('age', '>=', 4)
    .build();
  const expected = 'SELECT "name", "age" FROM "users" WHERE "foo"=\'blah\' OR "age">=\'4\'';
  t.equal(actual, expected);
  t.end();
});

test('order by: no direction provided', t=> {
  const actual = select()
    .from('users')
    .orderBy('foo')
    .build();
  const expected = 'SELECT * FROM "users" ORDER BY "foo"';
  t.equal(actual, expected);
  t.end();
});

test('order by: direction provided', t=> {
  const actual = select()
    .from('users')
    .orderBy('foo', 'asc')
    .where('foo', 'bar')
    .build();

  const expected = 'SELECT * FROM "users" WHERE "foo"=\'bar\' ORDER BY "foo" ASC';
  t.equal(actual, expected);
  t.end();
});

test('limit with no offset', t=> {
  const actual = select()
    .from('users')
    .limit(4)
    .build();
  const expected = 'SELECT * FROM "users" LIMIT \'4\'';
  t.equal(actual, expected);
  t.end();
});

test('limit with offset', t=> {
  const actual = select()
    .from('users')
    .limit(4, 5)
    .build();
  const expected = 'SELECT * FROM "users" LIMIT \'4\' OFFSET \'5\'';
  t.equal(actual, expected);
  t.end();
});