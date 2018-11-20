import {fluentMethod} from '../lib/util';
import {nodeSymbol} from './clause';
import {compositeNode, expressionNode, pointerNode} from '../lib/nodes';
import {Buildable} from '../lib/node-interfaces';

export interface WithClause<T> {
    with(label: string, builder: Buildable): T;
}

export const withAsMixin = <T>(): WithClause<T> => ({
    with: fluentMethod(function (label: string, builder: Buildable) {
        const n = this[nodeSymbol].with;
        const clause = compositeNode();
        clause.add(pointerNode(label), 'AS', expressionNode({value: builder}));
        n.add(clause);
    })
});
