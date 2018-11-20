import { fluentMethod } from '../lib/util';
import { nodeSymbol } from './clause';
import { compositeNode, expressionNode, pointerNode } from '../lib/nodes';
export const withAsMixin = () => ({
    with: fluentMethod(function (label, builder) {
        const n = this[nodeSymbol].with;
        const clause = compositeNode();
        clause.add(pointerNode(label), 'AS', expressionNode({ value: builder }));
        n.add(clause);
    })
});
