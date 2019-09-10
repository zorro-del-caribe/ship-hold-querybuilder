import { SelectLikeExpression } from '../lib/util';
import { FromClause, GroupByClause } from './clause';
import { ConditionFunction } from './conditions';
import { WithClause } from './with';
import { Builder, Cloneable, NodeParam } from '../lib/node-interfaces';
export declare const enum SortDirection {
    ASC = "ASC",
    DESC = "DESC"
}
interface FromWithClauseGroupBy extends FromClause, WithClause, GroupByClause<SelectBuilder> {
}
export interface SelectBuilder extends Builder, FromWithClauseGroupBy, WithClause, Cloneable {
    join(table: SelectLikeExpression): this;
    leftJoin(table: SelectLikeExpression): this;
    rightJoin(table: SelectLikeExpression): this;
    fullJoin(table: SelectLikeExpression): this;
    on: ConditionFunction<SelectBuilder>;
    orderBy(column: string, direction?: SortDirection): this;
    limit(limit: number, offset?: number): this;
    noop(): this;
    where: ConditionFunction<SelectBuilder>;
    select(...params: NodeParam<any>[]): this;
}
export declare const select: (...args: SelectLikeExpression[]) => SelectBuilder;
export {};
