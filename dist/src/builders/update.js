import { compositeNode, pointerNode, valueNode } from '../lib/nodes';
import { fluentMethod } from '../lib/util';
import where from './where';
import { clauseMixin, nodeSymbol } from './clause';
const createSetNode = (prop, value) => compositeNode()
    .add(pointerNode(prop), '=', valueNode(value));
const proto = Object.assign({
    where,
    set: fluentMethod(function (prop, value) {
        const setNodes = value === undefined ?
            Object.getOwnPropertyNames(prop)
                .map(p => createSetNode(p, prop[p])) :
            [createSetNode(prop, value)];
        this[nodeSymbol].values.add(...setNodes);
    }),
    build(params = {}) {
        const { table, values, from, where, returning } = this[nodeSymbol];
        const queryNode = compositeNode()
            .add('UPDATE', table, 'SET', values);
        if (from.length > 0) {
            queryNode.add('FROM', from);
        }
        if (where.length > 0) {
            queryNode.add('WHERE', where);
        }
        if (returning.length > 0) {
            queryNode.add('RETURNING', returning);
        }
        return queryNode.build(params);
    }
}, clauseMixin('returning', 'from', 'table'));
export default (tableName) => {
    const instance = Object.create(proto, {
        [nodeSymbol]: {
            value: {
                where: compositeNode(),
                table: compositeNode({ separator: ', ' }),
                returning: compositeNode({ separator: ', ' }),
                from: compositeNode({ separator: ', ' }),
                values: compositeNode({ separator: ', ' })
            }
        }
    });
    return instance.table(tableName);
};
