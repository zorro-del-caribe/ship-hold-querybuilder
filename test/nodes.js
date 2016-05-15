const test = require('tape');
const nodes = require('../lib/nodes');

test('value node: build return the passed value', t => {
  const n = nodes.valueNode('value');
  const actual = n.build();
  const expected = 'value';
  t.equal(actual, expected);
  t.end();
});

test('value node: should be able to receive node object', t=> {
  const n = nodes.valueNode({value: 'value'});
  const actual = n.build();
  const expected = 'value';
  t.equal(actual, expected);
  t.end();
});

test('pointer node: without as label', t=> {
  const n = nodes.pointerNode('blah');
  const actual = n.build();
  const expected = '"blah"';
  t.equal(actual, expected);
  t.end();
});

test('pointer node: with as label', t=> {
  const n = nodes.pointerNode({value: 'blah', as: 'foo'});
  const actual = n.build();
  const expected = '"blah" AS "foo"';
  t.equal(actual, expected);
  t.end();
});

test('composite node: use white space as default separator', t=> {
  const n1 = nodes.valueNode('foo');
  const n2 = nodes.pointerNode('bar');
  const n = nodes.compositeNode()
    .add(n1, n2);
  const actual = n.build();
  const expected = 'foo "bar"';
  t.equal(actual, expected);
  t.end();
});

test('composite node: use different string separator', t=> {
  const n1 = nodes.valueNode('foo');
  const n2 = nodes.pointerNode({value: 'bar.bim', as: 'bb'});
  const n = nodes.compositeNode({separator: ', '})
    .add(n1, n2);
  const actual = n.build(', ');
  const expected = 'foo, "bar"."bim" AS "bb"';
  t.equal(actual, expected);
  t.end();
});

test('expression node: wrap with brackets', t=> {
  const n = nodes.expressionNode('foo what =bar blah');
  const actual = n.build();
  const expected = '(foo what =bar blah)';
  t.equal(actual, expected);
  t.end();
});