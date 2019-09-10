import { IntoClause, ReturningClause } from './clause';
import { Builder, Cloneable } from '../lib/node-interfaces';
declare type WithIntoFieldReturningClause = IntoClause & ReturningClause;
export interface InsertBuilder extends WithIntoFieldReturningClause, Cloneable, Builder {
    readonly fields: string[];
    values: (values: any[]) => InsertBuilder;
}
declare type itemOrColumnDefinition = object | string;
export declare const insert: (map: itemOrColumnDefinition, ...othersProps: string[]) => InsertBuilder;
export {};
