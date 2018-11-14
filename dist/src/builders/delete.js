import { compositeNode } from '../lib/nodes';
import { clauseMixin, nodeSymbol } from './clause';
import where from './where';
import { eventuallyAddComposite } from '../lib/util';
import { withAsMixin } from './with';
const proto = Object.assign({
    where,
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
    const instance = Object.create(proto, {
        [nodeSymbol]: {
            value: {
                using: compositeNode(),
                table: compositeNode(),
                where: compositeNode(),
                with: compositeNode({ separator: ', ' })
            }
        }
    });
    if (tableName) {
        instance.from(tableName);
    }
    return instance;
};
