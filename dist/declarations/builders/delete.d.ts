import { Buildable, NodeParam } from '../lib/nodes';
import { TableClause, UsingClause } from './clause';
import { ConditionsBuilder, SQLComparisonOperator } from './conditions';
declare type WithTableUsingClause = TableClause & UsingClause;
export interface DeleteBuilder extends WithTableUsingClause, Buildable {
    where(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand?: NodeParam<any>): ConditionsBuilder<DeleteBuilder> & DeleteBuilder;
    from(...args: any[]): DeleteBuilder;
}
export declare const del: (tableName: string) => DeleteBuilder;
export {};
