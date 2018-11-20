import { CompositeNode, NodeParam } from '../lib/node-interfaces';
export declare const nodeSymbol: unique symbol;
interface Clause {
    node(name: string, newNode?: CompositeNode): CompositeNode;
}
export declare const clauseMixin: <T extends object>(...names: string[]) => T & Clause;
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
export {};
