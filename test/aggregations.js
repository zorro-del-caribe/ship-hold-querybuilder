import test from 'zora';
import select from '../dist/src/builders/select';
import {count} from '../dist/src/lib/aggregations';

test('select a count', t => {
    const actual = select(count('*'))
        .from('users')
        .build();

    t.equal(actual.text, 'SELECT COUNT(*) AS "count" FROM "users"');
});
