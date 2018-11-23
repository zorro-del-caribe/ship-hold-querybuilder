import test from 'zora';
import * as nodes from '../dist/src/lib/nodes';

test('identity node: build return the passed value', t => {
    const n = nodes.identityNode('value');
    const actual = n.build();
    const expected = 'value';
    t.equal(actual.text, expected);
    t.equal(actual.values.length, 0);
});

test('identity node: as parameter', t => {
    const n = nodes.identityNode('$foo');
    const actual = n.build({foo: 'blah'}, 3);
    t.equal(actual.text, '$3');
    t.deepEqual(actual.values, ['blah']);
});

test('identity node: should be able to receive node object', t => {
    const n = nodes.identityNode({value: 'value'});
    const actual = n.build().text;
    const expected = 'value';
    t.equal(actual, expected);
});

test('identity node: should be a Functor', t => {
    const n1 = nodes.identityNode('blah');
    const n2 = n1.map(v => String(v).toUpperCase());

    t.notEqual(n1, n2);
    t.deepEqual(n2.build().text, 'BLAH');
});

test('identity node: should be cloneable', t => {
    const n1 = nodes.identityNode('blah');
    const n2 = n1.clone();

    t.notEqual(n1, n2);
    t.deepEqual(n1.build(), n2.build());
});

test('value node: wrap with simple quote', t => {
    const n = nodes.valueNode('blah');
    const actual = n.build().text;
    t.equal(actual, `'blah'`);
});

test('value node: do not wrap parameterized value', t => {
    const n = nodes.valueNode('$foo');
    const actual = n.build({foo: 'blah'}, 5);
    t.equal(actual.text, '$5');
    t.deepEqual(actual.values, ['blah']);
});

test('value node should be a Functor', t => {
    const n = nodes.valueNode(2);
    const n2 = n.map(v => v * 3);
    t.notEqual(n, n2);
    t.equal(n2.build().text, 6);
});

test('value node should be cloneable', t => {
    const n = nodes.valueNode(2);
    const n2 = n.clone();
    t.notEqual(n, n2);
    t.deepEqual(n2.build(), n.build());
});

test('pointer node: without as label', t => {
    const n = nodes.pointerNode('blah');
    const actual = n.build().text;
    const expected = '"blah"';
    t.equal(actual, expected);
});

test('pointer node: with as label', t => {
    const n = nodes.pointerNode({value: 'blah', as: 'foo'});
    const actual = n.build().text;
    const expected = '"blah" AS "foo"';
    t.equal(actual, expected);
});

test('pointer node should be Functor', t => {
    const n = nodes.pointerNode('test');
    const n2 = n.map(v => String(v).toUpperCase());
    t.notEqual(n, n2);
    t.deepEqual(n.build().text, '"test"');
    t.deepEqual(n2.build().text, '"TEST"');
});

test('composite node: use white space as default separator', t => {
    const n1 = nodes.identityNode('foo');
    const n2 = nodes.pointerNode('bar');
    const n = nodes.compositeNode()
        .add(n1, n2);
    const actual = n.build().text;
    const expected = 'foo "bar"';
    t.equal(actual, expected);
});

test('composite node: increment params', t => {
    const n1 = nodes.identityNode('$foo');
    const n2 = nodes.identityNode('=');
    const n3 = nodes.valueNode('$boom');
    const n4 = nodes.identityNode('$blah');
    const sn = nodes.compositeNode().add(n1, n2);
    const sn2 = nodes.compositeNode().add(n3, n4);
    const n = nodes.compositeNode().add(sn, sn2);
    const actual = n.build({foo: 'foo', blah: 4, boom: 'boomval'}, 1);
    t.equal(actual.text, '$1 = $2 $3');
    t.deepEqual(actual.values, ['foo', 'boomval', 4]);
});

test('composite node: use different string separator', t => {
    const n1 = nodes.identityNode('foo');
    const n2 = nodes.pointerNode({value: 'bar.bim', as: 'bb'});
    const n = nodes.compositeNode({separator: ', '})
        .add(n1, n2);
    const actual = n.build().text;
    const expected = 'foo, "bar"."bim" AS "bb"';
    t.equal(actual, expected);
});

test('composite node: should be cloneable', t => {
    const n1 = nodes.identityNode('foo');
    const n2 = nodes.pointerNode({value: 'bar.bim', as: 'bb'});
    const n = nodes.compositeNode({separator: ', '})
        .add(n1, n2);
    const nbis = n.clone();
    t.equal(n.build().text, `foo, "bar"."bim" AS "bb"`);
    t.equal(nbis.build().text, `foo, "bar"."bim" AS "bb"`);
    t.notEqual(nbis, n);
});

test('expression node: wrap with brackets', t => {
    const condition = nodes.identityNode('foo');
    const n = nodes.expressionNode(condition);
    const actual = n.build().text;
    const expected = '(foo)';
    t.equal(actual, expected);
});

test('expression node with label', t => {
    const sub = nodes.identityNode('MY EXPR');
    const n = nodes.expressionNode({value: sub, as: 'exp'});
    const actual = n.build().text;
    const expected = '(MY EXPR) AS "exp"';
    t.equal(actual, expected);
});

test('expression node should be a Functor', t => {
    const sub = nodes.identityNode('MY EXPR');
    const n = nodes.expressionNode({value: sub, as: 'exp'});
    const n2 = n.map(sq => sq.map(v => String(v.toLowerCase())));
    t.equal(n.build().text, '(MY EXPR) AS "exp"');
    t.equal(n2.build().text, '(my expr) AS "exp"');
});

test('expression node should cloneable', t => {
    const sub = nodes.identityNode('MY EXPR');
    const n = nodes.expressionNode({value: sub, as: 'exp'});
    const n2 = n.clone();
    t.equal(n.build().text, '(MY EXPR) AS "exp"');
    t.equal(n2.build().text, '(MY EXPR) AS "exp"');
});
