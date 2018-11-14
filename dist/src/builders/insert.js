import { compositeNode, identityNode, valueNode } from '../lib/nodes';
import { eventuallyAddComposite, fluentMethod } from '../lib/util';
import { clauseMixin, nodeSymbol } from './clause';
import { withAsMixin } from './with';
const proto = Object.assign({
    value: fluentMethod(function (prop, value) {
        this.field(prop);
        this[nodeSymbol].values.add(value === undefined ? identityNode('DEFAULT') : valueNode(value));
    }),
    build(params = {}, offset = 1) {
        const queryNode = compositeNode();
        const add = eventuallyAddComposite(queryNode);
        const { into, with: withc, field, values, returning } = this[nodeSymbol];
        add(withc, 'with');
        queryNode.add('INSERT INTO', into, '(', field, ')', 'VALUES', '(', values, ')');
        add(returning, 'returning');
        return queryNode.build(params, offset);
    }
}, withAsMixin(), clauseMixin('into', 'field', 'returning'));
export const insert = (map = {}) => {
    const instance = Object.create(proto, {
        [nodeSymbol]: {
            value: {
                into: compositeNode({ separator: ', ' }),
                field: compositeNode({ separator: ', ' }),
                returning: compositeNode({ separator: ', ' }),
                values: compositeNode({ separator: ', ' }),
                with: compositeNode({ separator: ', ' })
            }
        }
    });
    for (const [key, value] of Object.entries(map)) {
        instance.value(key, value);
    }
    return instance;
};
