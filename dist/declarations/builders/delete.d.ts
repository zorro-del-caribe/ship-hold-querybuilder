import { ReturningClause, TableClause, UsingClause } from './clause';
import { ConditionsBuilder, SQLComparisonOperator } from './conditions';
import { NodeParam, Builder, Cloneable } from '../lib/node-interfaces';
declare type WithTableUsingReturningClause = TableClause & UsingClause & ReturningClause;
export interface DeleteBuilder extends WithTableUsingReturningClause, Builder, Cloneable {
    where(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand?: NodeParam<any>): ConditionsBuilder<DeleteBuilder> & DeleteBuilder;
    from(...args: any[]): DeleteBuilder;
    noop(): DeleteBuilder;
}
export declare const del: (tableName: string) => DeleteBuilder;
export {};
