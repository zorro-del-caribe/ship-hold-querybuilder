const test = require('tape');
const conditions = require('../builders/conditions');

test('use provided operator', t=> {
  const actual = conditions()
    .if('foo', '<=', 'bar')
    .build();
  const expected = '"foo"<=\'bar\'';
  t.equal(actual, expected);
  t.end();
});

test('use default operator', t=> {
  const actual = conditions()
    .if('foo', 'bar')
    .build();
  const expected = '"foo"=\'bar\'';
  t.equal(actual, expected);
  t.end();
});

test('combine conditions', t=> {
  const actual = conditions()
    .if('foo', '<=', 'bar')
    .and('blah.what', 'woot')
    .or('age', '<=', 66)
    .build();
  const expected = '"foo"<=\'bar\' AND "blah"."what"=\'woot\' OR "age"<=\'66\'';
  t.equal(actual, expected);
  t.end();
});

test('use subquery', t=> {
  const subq = conditions()
    .if('foo', 'bar')
    .and('bar', '>', 4);

  const actual = conditions()
    .if('wat', 'blah')
    .or(subq)
    .build();

  const expected = '"wat"=\'blah\' OR ("foo"=\'bar\' AND "bar">\'4\')';
  t.equal(actual, expected);
  t.end();
});
