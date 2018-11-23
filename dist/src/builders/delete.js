import { compositeNode } from '../lib/nodes';
import { clauseMixin, nodeSymbol } from './clause';
import where from './where';
import { eventuallyAddComposite, fluentMethod } from '../lib/util';
import { withAsMixin } from './with';
const proto = Object.assign({
    where,
    noop: fluentMethod(function () {
    }),
    from(...args) {
        return this.table(...args);
    },
    build(params = {}, offset = 1) {
        const { table, with: withc, using, where } = this[nodeSymbol];
        const queryNode = compositeNode();
        const add = eventuallyAddComposite(queryNode);
        add(withc, 'with');
        queryNode.add('DELETE FROM', table);
        add(using, 'using');
        add(where, 'where');
        return queryNode.build(params, offset);
    }
}, withAsMixin(), clauseMixin('table', 'using'));
export const del = (tableName) => {
    const nodes = {
        using: compositeNode({ separator: ', ' }),
        table: compositeNode(),
        where: compositeNode(),
        with: compositeNode({ separator: ', ' })
    };
    const instance = Object.create(Object.assign({
        clone() {
            const clone = del(tableName);
            for (const [key, value] of Object.entries(nodes)) {
                clone.node(key, value.clone());
            }
            return clone;
        }
    }, proto), {
        [nodeSymbol]: {
            value: nodes
        }
    });
    if (tableName) {
        instance.from(tableName);
    }
    return instance;
};
