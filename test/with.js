import {withAsMixin} from '../dist/src/builders/with';
import {nodeSymbol} from '../dist/src/builders/clause';
import {compositeNode, select} from '../dist/src';

const create = () => {

    const withNode = compositeNode({separator: ', '});

    return Object.assign({
        [nodeSymbol]: {
            with: withNode
        },
        build(params = {}, offset = 1) {
            return withNode.build(params, offset);
        }
    }, withAsMixin());
};

export default ({test}) => {

    test('with clause: should pass the with arguments along', t => {
        const b = create();
        const s1 = select().from('foo');
        b.with('bim', s1);

        t.equal(b.build().text, '"bim" AS (SELECT * FROM "foo")');
    });

    test('with clause: should chain with arguments clauses', t => {
        const b = create();
        const s1 = select().from('foo');
        const s2 = select().from('bar');
        b.with('bim', s1).with('bam', s2);

        t.equal(b.build().text, '"bim" AS (SELECT * FROM "foo"), "bam" AS (SELECT * FROM "bar")');
    });

    test('with clause: should pass parameters along', t => {
        const b = create();
        const s1 = select().from('foo').limit('$limit1');
        const s2 = select().from('bar').limit('$limit2');
        b.with('bim', s1).with('bam', s2);

        const result = b.build({limit1: 42, limit2: 66});
        t.equal(result.text, '"bim" AS (SELECT * FROM "foo" LIMIT $1), "bam" AS (SELECT * FROM "bar" LIMIT $2)');
        t.deepEqual(result.values, [42, 66]);
    });
};