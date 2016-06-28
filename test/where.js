const where = require('../builders/where');
const stampit = require('stampit');
const test = require('tape');

test('create a chainable delegation', t=> {
  const mainBuilder = stampit()
    .methods({
      foo(){
        return this;
      },
      build(){
        return 'build';
      }
    }).compose(where);

  const actual = mainBuilder()
    .where('blah', 'woot')
    .and('test', 'test2')
    .foo()
    .build();
  const expected = 'build';
  t.equal(actual, expected);
  t.end();
});