import { NodeParam } from '../lib/nodes';
export declare const nodeSymbol: unique symbol;
export declare const clauseMixin: <T extends object>(...names: string[]) => T;
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
