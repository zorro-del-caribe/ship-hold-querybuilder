import { Buildable } from '../lib/nodes';
import { FieldClause, IntoClause, ReturningClause } from './clause';
declare type WithIntoFieldReturningClause = IntoClause & FieldClause & ReturningClause;
export interface InsertBuilder extends WithIntoFieldReturningClause, Buildable {
    value: <T>(prop: string, value: T) => InsertBuilder;
}
export declare const insert: (map?: {}) => InsertBuilder;
export {};
