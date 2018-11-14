import {expressionNode, NodeParam, pointerNode} from '../lib/nodes';
import {fluentMethod, isSubQuery} from '../lib/util';

export const nodeSymbol = Symbol('nodes');

export const clauseMixin = <T extends object>(...names: string[]): T => {
    const api = {
        node(name, newNode) {
            const node = this[nodeSymbol][name];
            if (newNode === undefined) {
                return node;
            }
            return this[nodeSymbol][name] = newNode;
        }
    };
    for (const name of names) {
        api[name] = fluentMethod(function (this: T, ...args: NodeParam<any>[]) {
            // todo we might make a difference here between clauses which accept subqueries and other subqueries with mandatory aliases ex SELECT ... VS FROM ...
            this[nodeSymbol][name].add(...args.map(n => isSubQuery(n) ? expressionNode(n) : pointerNode(n)));
        });
    }
    return <T>api;
};

export interface IntoClause {
    into: (...args: NodeParam<any>[]) => IntoClause;
}

export interface ReturningClause {
    returning: (...args: NodeParam<any>[]) => ReturningClause;
}

export interface FromClause {
    from: (...args: NodeParam<any>[]) => FromClause;
}

export interface TableClause {
    table: (...args: NodeParam<any>[]) => TableClause;
}

export interface FieldClause {
    field: (...args: NodeParam<any>[]) => FieldClause;
}

export interface UsingClause {
    using: (...args: NodeParam<any>[]) => UsingClause;
}
