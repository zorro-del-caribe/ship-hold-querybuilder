import { SelectLikeExpression } from '../lib/util';
import { FromClause, GroupByClause } from './clause';
import { ConditionFunction } from './conditions';
import { WithClause } from './with';
import { Builder, Cloneable, NodeParam } from '../lib/node-interfaces';
export declare const enum SortDirection {
    ASC = "ASC",
    DESC = "DESC"
}
interface FromWithClauseGroupBy<T> extends FromClause<T>, WithClause<T>, GroupByClause<T> {
}
export interface SelectBuilder extends Builder, FromWithClauseGroupBy<SelectBuilder>, WithClause<SelectBuilder>, Cloneable<SelectBuilder> {
    join(table: SelectLikeExpression): SelectBuilder;
    leftJoin(table: SelectLikeExpression): SelectBuilder;
    rightJoin(table: SelectLikeExpression): SelectBuilder;
    fullJoin(table: SelectLikeExpression): SelectBuilder;
    on: ConditionFunction<SelectBuilder>;
    orderBy(column: string, direction?: SortDirection): SelectBuilder;
    limit(limit: number, offset?: number): SelectBuilder;
    noop(): SelectBuilder;
    where: ConditionFunction<SelectBuilder>;
    select(...params: NodeParam<any>[]): SelectBuilder;
}
export declare const select: (...args: SelectLikeExpression[]) => SelectBuilder;
export {};
