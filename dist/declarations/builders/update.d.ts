import { Buildable, NodeParam } from '../lib/nodes';
import { FieldClause, IntoClause, ReturningClause } from './clause';
import { ConditionsBuilder, SQLComparisonOperator } from './conditions';
declare type WithReturningFromTable = IntoClause & FieldClause & ReturningClause;
export interface UpdateBuilder extends WithReturningFromTable, Buildable {
    where(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand?: NodeParam<any>): ConditionsBuilder<UpdateBuilder> & UpdateBuilder;
    set<T>(prop: string, value: T): UpdateBuilder;
}
export declare const update: (tableName: string) => UpdateBuilder;
export {};
