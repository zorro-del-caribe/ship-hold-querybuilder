const test = require('tape');
const update = require('../builders/update');

test('basic update', t=> {
  const actual = update('users')
    .set('foo', 'bar')
    .set('woot', 4)
    .build().text;

  const expected = 'UPDATE "users" SET "foo"=\'bar\', "woot"=\'4\'';
  t.equal(actual, expected);
  t.end();
});

test('support label on table', t=> {
  const actual = update({value: 'users', as: 'u'})
    .set('u.foo', 'bar')
    .build().text;
  const expected = 'UPDATE "users" AS "u" SET "u"."foo"=\'bar\'';
  t.equal(actual, expected);
  t.end();
});

test('update with map value', t=> {
  const actual = update('users')
    .set({
      foo: 'bar',
      woot: 4
    })
    .build().text;
  const expected = 'UPDATE "users" SET "foo"=\'bar\', "woot"=\'4\'';
  t.equal(actual, expected);
  t.end();
});

test('update with where clause', t=> {
  const actual = update('users')
    .set('foo', 'bar')
    .set('woot', 4)
    .where('foo', '<', 'bar')
    .and('woot', 6)
    .build().text;
  const expected = 'UPDATE "users" SET "foo"=\'bar\', "woot"=\'4\' WHERE "foo"<\'bar\' AND "woot"=\'6\'';
  t.equal(actual, expected);
  t.end();
});

test('update with parameters', t=> {
  const actual = update('users')
    .set('foo', '$bar')
    .set('woot', 4)
    .where('foo', '<', '$bim')
    .and('woot', '$woot')
    .build({bar: 'bar', bim: 'foo', woot: 7});
  const expected = 'UPDATE "users" SET "foo"=$1, "woot"=\'4\' WHERE "foo"<$2 AND "woot"=$3';
  t.equal(actual.text, expected);
  t.deepEqual(actual.values,['bar','foo',7]);
  t.end();
});