import test from 'zora';
import {select, count} from '../dist/src';

test('select a count', t => {
    const actual = select(count('*'))
        .from('users')
        .build();

    t.equal(actual.text, 'SELECT count(*) AS "count" FROM "users"');
});
