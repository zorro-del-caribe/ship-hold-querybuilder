import {select, jsonAgg, coalesce} from '../dist/src';
import test from 'zora';

test('COALESCE operator', t => {
    const builder = select(coalesce(['foo', 'bar'])).from('foo');

    t.deepEqual(builder.build().text, `SELECT COALESCE('foo','bar') FROM "foo"`);
});

test('COALESCE operator with nested function call', t => {
    const builder = select(coalesce([jsonAgg('*'), `'[]::json'`])).from('foo');

    t.deepEqual(builder.build().text, `SELECT COALESCE(json_agg(*),'[]::json') FROM "foo"`);
});
