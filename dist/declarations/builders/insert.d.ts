import { IntoClause, ReturningClause } from './clause';
import { Builder } from '../lib/node-interfaces';
declare type WithIntoFieldReturningClause = IntoClause<InsertBuilder> & ReturningClause<InsertBuilder>;
export interface InsertBuilder extends WithIntoFieldReturningClause, Builder {
    readonly fields: string[];
    values: (values: any[]) => InsertBuilder;
}
declare type itemOrColumnDefinition = object | string;
export declare const insert: (map: itemOrColumnDefinition, ...othersProps: string[]) => InsertBuilder;
export {};
