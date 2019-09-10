import { CompositeNode, NodeParam } from '../lib/node-interfaces';
import { ConditionFunction } from './conditions';
export declare const nodeSymbol: unique symbol;
interface Clause {
    node(name: string, newNode?: CompositeNode): CompositeNode;
}
export declare const clauseMixin: <T extends object>(...names: string[]) => T & Clause;
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
export {};
