const test = require('tape');
const nodes = require('../lib/nodes');

test('value node: build return the passed value', t => {
  const n = nodes.valueNode('value');
  const actual = n.build();
  const expected = 'value';
  t.equal(actual.text, expected);
  t.equal(actual.values.length, 0);
  t.end();
});

test('value node; as parameter', t=> {
  const n = nodes.valueNode('$foo');
  const actual = n.build({foo: 'blah'}, 3);
  t.equal(actual.text, '$3');
  t.deepEqual(actual.values, ['blah']);
  t.end();
});

test('value node: should be able to receive node object', t=> {
  const n = nodes.valueNode({value: 'value'});
  const actual = n.build().text;
  const expected = 'value';
  t.equal(actual, expected);
  t.end();
});

test('pointer node: without as label', t=> {
  const n = nodes.pointerNode('blah');
  const actual = n.build().text;
  const expected = '"blah"';
  t.equal(actual, expected);
  t.end();
});

test('pointer node: with as label', t=> {
  const n = nodes.pointerNode({value: 'blah', as: 'foo'});
  const actual = n.build().text;
  const expected = '"blah" AS "foo"';
  t.equal(actual, expected);
  t.end();
});

test('composite node: use white space as default separator', t=> {
  const n1 = nodes.valueNode('foo');
  const n2 = nodes.pointerNode('bar');
  const n = nodes.compositeNode()
    .add(n1, n2);
  const actual = n.build().text;
  const expected = 'foo "bar"';
  t.equal(actual, expected);
  t.end();
});

test('composite node: increment params', t=> {
  const n1 = nodes.valueNode('$foo');
  const n2 = nodes.valueNode('=');
  const n3 = nodes.castNode('$boom');
  const n4 = nodes.valueNode('$blah');
  const sn = nodes.compositeNode().add(n1, n2);
  const sn2 = nodes.compositeNode().add(n3, n4);
  const n = nodes.compositeNode().add(sn, sn2);
  const actual = n.build({foo: 'foo', blah: 4, boom:'boomval'});
  t.equal(actual.text, '$1 = $2 $3');
  t.deepEqual(actual.values, ['foo','boomval', 4]);
  t.end();
});

test('composite node: use different string separator', t=> {
  const n1 = nodes.valueNode('foo');
  const n2 = nodes.pointerNode({value: 'bar.bim', as: 'bb'});
  const n = nodes.compositeNode({separator: ', '})
    .add(n1, n2);
  const actual = n.build().text;
  const expected = 'foo, "bar"."bim" AS "bb"';
  t.equal(actual, expected);
  t.end();
});

test('expression node: wrap with brackets', t=> {
  const n = nodes.expressionNode('foo what =bar blah');
  const actual = n.build().text;
  const expected = '(foo what =bar blah)';
  t.equal(actual, expected);
  t.end();
});

test('cast node: wrap with simple quote', t=> {
  const n = nodes.castNode('blah');
  const actual = n.build().text;
  t.equal(actual, "'blah'");
  t.end();
});

test('cast node: do not wrap parameterized value', t=> {
  const n = nodes.castNode('$foo');
  const actual = n.build({foo: 'blah'}, 5);
  t.equal(actual.text, '$5');
  t.deepEqual(actual.values, ['blah']);
  t.end();
});