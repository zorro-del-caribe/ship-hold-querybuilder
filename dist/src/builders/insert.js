import { compositeNode, identityNode, valueNode, pointerNode } from '../lib/nodes';
import { eventuallyAddComposite, fluentMethod } from '../lib/util';
import { clauseMixin, nodeSymbol } from './clause';
import { withAsMixin } from './with';
const createValuesNode = (props) => item => {
    const valuesNode = compositeNode({ separator: ', ' });
    for (const prop of props) {
        valuesNode.add(item[prop] === undefined ?
            identityNode('DEFAULT') :
            valueNode(item[prop]));
    }
    return compositeNode().add('(', valuesNode, ')');
};
const proto = Object.assign({
    values: fluentMethod(function (item) {
        const items = Array.isArray(item) ? item : [item];
        const mapFn = createValuesNode(this.fields);
        for (const i of items) {
            this[nodeSymbol].values.add(mapFn(i));
        }
    }),
    build(params = {}, offset = 1) {
        const queryNode = compositeNode();
        const add = eventuallyAddComposite(queryNode);
        const { into, with: withc, values, returning } = this[nodeSymbol];
        const fieldsNode = compositeNode({ separator: ', ' }).add(...this.fields.map(pointerNode));
        add(withc, 'with');
        queryNode.add('INSERT INTO', into, '(', fieldsNode, ')', 'VALUES', values);
        add(returning, 'returning');
        return queryNode.build(params, offset);
    }
}, withAsMixin(), clauseMixin('into', 'returning'));
export const insert = (map, ...othersProps) => {
    const fields = typeof map === 'string' ? [map].concat(othersProps) : Object.keys(map);
    const nodes = {
        into: compositeNode({ separator: ', ' }),
        returning: compositeNode({ separator: ', ' }),
        values: compositeNode({ separator: ', ' }),
        with: compositeNode({ separator: ', ' })
    };
    const instance = Object.create(Object.assign({
        clone() {
            const clone = insert(map, ...othersProps);
            for (const [key, value] of Object.entries(nodes)) {
                clone.node(key, value.clone());
            }
            return clone;
        }
    }, proto), {
        [nodeSymbol]: {
            value: nodes
        },
        fields: { value: fields }
    });
    if (typeof map !== 'string') {
        instance.values(map);
    }
    return instance;
};
