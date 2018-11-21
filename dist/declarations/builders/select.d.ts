import { SelectLikeExpression } from '../lib/util';
import { FromClause } from './clause';
import { ConditionFunction } from './conditions';
import { WithClause } from './with';
import { Builder, NodeParam } from '../lib/node-interfaces';
export declare const enum SortDirection {
    ASC = "ASC",
    DESC = "DESC"
}
export interface SelectBuilder extends Builder, FromClause<SelectBuilder>, WithClause<SelectBuilder> {
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
