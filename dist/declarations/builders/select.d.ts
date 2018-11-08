import { Buildable, NodeParam } from '../lib/nodes';
import { FromClause } from './clause';
import { ConditionsBuilder, SQLComparisonOperator } from './conditions';
export declare const enum SortDirection {
    ASC = "ASC",
    DESC = "DESC"
}
export interface SelectBuilder extends Buildable, FromClause {
    join(table: string): SelectBuilder;
    leftJoin(table: string): SelectBuilder;
    rightJoin(table: string): SelectBuilder;
    fullJoin(table: string): SelectBuilder;
    on(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator | NodeParam<any>, rightOperand?: NodeParam<any>): SelectBuilder;
    orderBy(column: string, direction?: SortDirection): SelectBuilder;
    limit(limit: number, offset?: number): SelectBuilder;
    noop(): SelectBuilder;
    where(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator | NodeParam<any>, rightOperand?: NodeParam<any>): ConditionsBuilder<SelectBuilder> & SelectBuilder;
    select(...params: NodeParam<any>[]): SelectBuilder;
}
export declare const select: (...args: NodeParam<any>[]) => SelectBuilder;
