import { TableClause, UsingClause } from './clause';
import { ConditionsBuilder, SQLComparisonOperator } from './conditions';
import { NodeParam, Builder, Cloneable } from '../lib/node-interfaces';
declare type WithTableUsingClause = TableClause<DeleteBuilder> & UsingClause<DeleteBuilder>;
export interface DeleteBuilder extends WithTableUsingClause, Builder, Cloneable<DeleteBuilder> {
    where(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand?: NodeParam<any>): ConditionsBuilder<DeleteBuilder> & DeleteBuilder;
    from(...args: any[]): DeleteBuilder;
    noop(): DeleteBuilder;
}
export declare const del: (tableName: string) => DeleteBuilder;
export {};
