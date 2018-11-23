import { IntoClause, ReturningClause } from './clause';
import { ConditionsBuilder, SQLComparisonOperator } from './conditions';
import { Builder, NodeParam } from '../lib/node-interfaces';
declare type WithReturningFromTable = IntoClause<UpdateBuilder> & ReturningClause<UpdateBuilder>;
export interface UpdateBuilder extends WithReturningFromTable, Builder {
    where(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand?: NodeParam<any>): ConditionsBuilder<UpdateBuilder> & UpdateBuilder;
    set<T>(prop: string, value: T): UpdateBuilder;
    noop: () => UpdateBuilder;
}
export declare const update: (tableName: string) => UpdateBuilder;
export {};
