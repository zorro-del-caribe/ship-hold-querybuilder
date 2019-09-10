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

export interface IntoClause {
    into: (...args: NodeParam<any>[]) => this;
}

export interface ReturningClause {
    returning: (...args: NodeParam<any>[]) => this;
}

export interface FromClause {
    from: (...args: NodeParam<any>[]) => this;
}

export interface TableClause {
    table: (...args: NodeParam<any>[]) => this;
}

export interface UsingClause {
    using: (...args: NodeParam<any>[]) => this;
}

export interface GroupByClause<T> {
    groupBy: (column: string, ...moreColumns: string[]) => this;
    having: ConditionFunction<T>;
}
