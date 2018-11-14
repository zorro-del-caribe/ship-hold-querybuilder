import {fluentMethod} from '../lib/util';
import {nodeSymbol} from './clause';
import {compositeNode, expressionNode, Buildable, pointerNode} from '..';

export interface WithClause {
    with(label: string, builder: Buildable): WithClause;
}

export const withAsMixin = (): WithClause => ({
    with: fluentMethod(function (label: string, builder: Buildable) {
        const n = this[nodeSymbol].with;
        const clause = compositeNode();
        clause.add(pointerNode(label), 'AS', expressionNode({value: builder}));
        n.add(clause);
    })
});
