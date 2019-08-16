import {test} from 'zora';
import {compositeNode} from '../dist/src';
import where from '../dist/src/builders/where';
import {nodeSymbol} from '../dist/src/builders/clause';

const mainBuilder = () => {
    return {
        [nodeSymbol]: {where: compositeNode()},
        foo() {
            return this;
        },
        build() {
            const queryNode = compositeNode();
            queryNode.add('build >', this[nodeSymbol].where);
            return queryNode.build();
        },
        where
    };
};

test('where builder: create a chainable delegation', t => {
    const actual = mainBuilder()
        .where('blah', 'woot')
        .and('test', 'test2')
        .foo()
        .build().text;
    const expected = `build > "blah" = 'woot' AND "test" = 'test2'`;
    t.equal(actual, expected);
});

test('where builder: should treat various where calls as AND clauses', t => {
    const actual = mainBuilder()
        .where('blah', 'woot')
        .and('test', 'test2')
        .foo()
        .where('bim', 'bam')
        .or('mib', 'mab')
        .build().text;
    const expected = `build > "blah" = 'woot' AND "test" = 'test2' AND ( "bim" = 'bam' OR "mib" = 'mab' )`;
    t.equal(actual, expected);
});
