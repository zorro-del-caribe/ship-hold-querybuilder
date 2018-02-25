import test from 'zora';
import conditions from '../src/builders/conditions';

test('condition builder: use provided operator', t => {
	const actual = conditions()
		.if('foo', '<=', 'bar')
		.build().text;
	const expected = '"foo" <= \'bar\'';
	t.equal(actual, expected);
});

test('condition builder: use default operator', t => {
	const actual = conditions()
		.if('foo', 'bar')
		.build().text;
	const expected = '"foo" = \'bar\'';
	t.equal(actual, expected);
});

test('condition builder: combine conditions', t => {
	const actual = conditions()
		.if('foo', '<=', 'bar')
		.and('blah.what', 'woot')
		.or('age', '<=', 66)
		.build().text;
	const expected = '"foo" <= \'bar\' AND "blah"."what" = \'woot\' OR "age" <= 66';
	t.equal(actual, expected);
});

test('condition builder: combine conditions with params', t => {
	const actual = conditions()
		.if('foo', '<=', '$bar')
		.and('blah.what', '$what')
		.or('age', '<=', '$age')
		.build({bar: 'barval', what: 'whatval', age: 4});
	t.equal(actual.text, '"foo" <= $1 AND "blah"."what" = $2 OR "age" <= $3');
	t.deepEqual(actual.values, ['barval', 'whatval', 4]);
});

test('condition builder: use subquery', t => {
	const subq = conditions()
		.if('foo', 'bar')
		.and('bar', '>', 4);

	const actual = conditions()
		.if('wat', 'blah')
		.or(subq)
		.build().text;

	const expected = '"wat" = \'blah\' OR ("foo" = \'bar\' AND "bar" > 4)';
	t.equal(actual, expected);
});

test('condition builder: sub query with params', t => {
	const subq = conditions()
		.if('foo', 'bar')
		.and('bar', '>', '$bar');

	const actual = conditions()
		.if('wat', '$wat')
		.or(subq)
		.build({bar: 4, wat: 'blah'});

	const expected = '"wat" = $1 OR ("foo" = \'bar\' AND "bar" > $2)';
	t.equal(actual.text, expected);
	t.deepEqual(actual.values, ['blah', 4]);
});

test('condition builder: support object as json', t => {
	const actual = conditions()
		.if('jsondoc', '@>', {foo: 'bar'})
		.build();

	const expected = '"jsondoc" @> \'{"foo":"bar"}\'';

	t.equal(actual.text, expected);
});
