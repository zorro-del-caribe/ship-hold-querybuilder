import {count, select} from '../dist/src';

export default ({test}) => {

    test('select a count', t => {
        const actual = select(count('*'))
            .from('users')
            .build();

        t.equal(actual.text, 'SELECT count(*) FROM "users"');
    });

    test('select a count with alias', t => {
        const actual = select({value: count('*'), as: 'foo'})
            .from('users')
            .build();

        t.equal(actual.text, 'SELECT (count(*)) AS "foo" FROM "users"');
    });
};
