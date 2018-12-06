import { ReturningClause, TableClause, UsingClause } from './clause';
import { ConditionsBuilder, SQLComparisonOperator } from './conditions';
import { NodeParam, Builder, Cloneable } from '../lib/node-interfaces';
declare type WithTableUsingReturningClause = TableClause<DeleteBuilder> & UsingClause<DeleteBuilder> & ReturningClause<DeleteBuilder>;
export interface DeleteBuilder extends WithTableUsingReturningClause, Builder, Cloneable<DeleteBuilder> {
    where(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand?: NodeParam<any>): ConditionsBuilder<DeleteBuilder> & DeleteBuilder;
    from(...args: any[]): DeleteBuilder;
    noop(): DeleteBuilder;
}
export declare const del: (tableName: string) => DeleteBuilder;
export {};
