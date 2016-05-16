const test = require('tape');
const del = require('../builders/delete');

test('basic delete', t=> {
  const actual = del('users')
    .build();
  const expected = 'DELETE FROM "users"';
  t.equal(actual, expected);
  t.end();
});

test('delete with where clause', t=> {
  const actual = del('users')
    .where('foo', '<', 'bar')
    .and('woot', 6)
    .build();
  const expected = 'DELETE FROM "users" WHERE "foo"<\'bar\' AND "woot"=\'6\'';
  t.equal(actual, expected);
  t.end();
});