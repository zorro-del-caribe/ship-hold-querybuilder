import {fluentMethod, selectLikeExpression} from '../lib/util';
import {Buildable, CompositeNode, NodeParam} from '../lib/node-interfaces';
import {ConditionFunction} from './conditions';

export const nodeSymbol = Symbol('nodes');

interface Clause {
    node(name: string, newNode?: CompositeNode): CompositeNode;
}

export const clauseMixin = <T extends object>(...names: string[]): T & Clause => {
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
        api[name] = fluentMethod(function (this: T, ...args: (NodeParam<any> | Buildable)[]) {
            this[nodeSymbol][name].add(...args.map(selectLikeExpression)); // Technically not all the clause would accept fromable
        });
    }
    return <T & Clause>api;
};

export interface IntoClause<T> {
    into: (...args: NodeParam<any>[]) => T;
}

export interface ReturningClause<T> {
    returning: (...args: NodeParam<any>[]) => T;
}

export interface FromClause<T> {
    from: (...args: NodeParam<any>[]) => T;
}

export interface TableClause<T> {
    table: (...args: NodeParam<any>[]) => T;
}

export interface UsingClause<T> {
    using: (...args: NodeParam<any>[]) => T;
}

export interface GroupByClause<T> {
    groupBy: (column: string, ...moreColumns: string[]) => T;
    having: ConditionFunction<T>;
}
