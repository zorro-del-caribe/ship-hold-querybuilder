import test from 'zora';
import select from '../src/builders/select';
import {count} from '../src/lib/aggregations';

test('select a count', t => {
	const actual = select(count('*'))
		.from('users')
		.build();

	t.equal(actual.text, 'SELECT COUNT(*) AS "count" FROM "users"');
});
