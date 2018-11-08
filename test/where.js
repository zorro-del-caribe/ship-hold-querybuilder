import test from 'zora';
import where from '../dist/src/builders/where';
import {compositeNode} from '../dist/src/lib/nodes';
import {nodeSymbol} from '../dist/src/builders/clause';

test('where builder: create a chainable delegation', t => {
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

    const actual = mainBuilder()
        .where('blah', 'woot')
        .and('test', 'test2')
        .foo()
        .build().text;
    const expected = `build > "blah" = 'woot' AND "test" = 'test2'`;
    t.equal(actual, expected);
});
