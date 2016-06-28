const test = require('tape');
const qb = require('../index')();
const agg = qb.aggregate;

test('select a count', t=> {
  const actual = qb.select(agg.count('*'))
    .from('users')
    .build();
  t.equal(actual.text, 'SELECT COUNT(*) AS "count" FROM "users"');
  t.end();
});