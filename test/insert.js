const insert = require('../builders/insert');
const test = require('tape');

test('insert values as defined by value', t=> {
  const actual = insert()
    .value('foo', 'bar')
    .value('age', 4)
    .into('users')
    .build().text;
  const expected = 'INSERT INTO "users" ( "foo", "age" ) VALUES ( \'bar\', \'4\' )';
  t.equal(actual, expected);
  t.end();
});

test('insert hash map value object', t=> {
  const actual = insert({foo: 'bar', age: 4})
    .into('users')
    .build().text;
  const expected = 'INSERT INTO "users" ( "foo", "age" ) VALUES ( \'bar\', \'4\' )';
  t.equal(actual, expected);
  t.end();
});

test('fill with default if not value is provided', t=> {
  const actual = insert()
    .value('foo')
    .value('age', 4)
    .value('bar')
    .into('users')
    .build().text;

  const expected = 'INSERT INTO "users" ( "foo", "age", "bar" ) VALUES ( DEFAULT, \'4\', DEFAULT )';
  t.equal(actual, expected);
  t.end();
});

test('use query params', t=> {
  const actual = insert()
    .into('users')
    .value('foo', '$foo')
    .value('age', '$age')
    .build({foo: 'foo', age: 'blah'});

  t.equal(actual.text, 'INSERT INTO "users" ( "foo", "age" ) VALUES ( $1, $2 )');
  t.deepEqual(actual.values, ['foo', 'blah']);
  t.end();
});