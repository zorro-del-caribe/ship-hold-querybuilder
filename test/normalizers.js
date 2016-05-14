const test = require('tape');
const normalizers = require('../lib/normalizers');

test('quote normalizer: wrap within double quote', t=> {
  const normalizer = normalizers.quoteWrapperNormalizer();
  const actual = normalizer.normalize({value: 'foo'}).value;
  const expected = '"foo"';
  t.equal(actual, expected);
  t.end();
});

test('quote normalizer: do not wrap already wrapped', t=> {
  const normalizer = normalizers.quoteWrapperNormalizer();
  const actual = normalizer.normalize({value: '"foo"'}).value;
  const expected = '"foo"';
  t.equal(actual, expected);
  t.end();
});

test('quote normalizer: wrap part of dot expression', t=> {
  const normalizer = normalizers.quoteWrapperNormalizer();
  const actual = normalizer.normalize({value: 'foo.bar'}).value;
  const expected = '"foo"."bar"';
  t.equal(actual, expected);
  t.end();
});

test('quote normalizer: should not wrap star character', t=> {
  const normalizer = normalizers.quoteWrapperNormalizer();
  const actual = normalizer.normalize({value: '*'}).value;
  const expected = '*';
  t.equal(actual, expected);
  t.end();
});

test('quote normalizer: should not wrap star character within a dot expression', t=> {
  const normalizer = normalizers.quoteWrapperNormalizer();
  const actual = normalizer.normalize({value: 'foo.*'}).value;
  const expected = '"foo".*';
  t.equal(actual, expected);
  t.end();
});

test('label normalizer: should wrap the "as" part of the node', t=> {
  const normalizer = normalizers.labelNormalizer();
  const actual = normalizer.normalize({as: 'foo'}).as;
  const expected = '"foo"';
  t.equal(actual, expected);
  t.end();
});

test('label normalizer: should not wrap the "as" part of the node if already wrapped', t=> {
  const normalizer = normalizers.labelNormalizer();
  const actual = normalizer.normalize({as: '"foo"'}).as;
  const expected = '"foo"';
  t.equal(actual, expected);
  t.end();
});