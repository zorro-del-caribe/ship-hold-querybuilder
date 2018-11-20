import { Buildable, CompositeNode } from '../lib/node-interfaces';
export declare const enum SQLComparisonOperator {
    EQUAL = "=",
    LOWER_THAN = "<",
    LOWER_THAN_OR_EQUAL = "<=",
    GREATER_THAN = ">",
    GREATER_THAN_OR_EQUAL = ">=",
    NOT_EQUAL = "<>",
    IS = "IS",
    IS_NOT = "IS NOT",
    BETWEEN = "BETWEEN",
    NOT_BETWEEN = "NOT BETWEEN",
    BETWEEN_SYMETRIC = "BETWEEN SYMETRIC",
    NOT_BETWEEN_SYMETRIC = "NOT BETWEEN SYMETRIC",
    IS_DISTINCT = "IS DISTINCT",
    IS_NOT_DISTINCT = "IS NOT DISTINCT",
    LIKE = "LIKE",
    ILIKE = "ILIKE",
    CONTAINS = "@>",
    IS_CONTAINED_BY = "<@",
    OVERLAP = "&&",
    CONCATENATE = "||"
}
export interface ConditionFunction<T> {
    (leftOperand: any, operator?: any, rightOperand?: any): ConditionsBuilder<T> & T;
}
export interface ConditionsBuilder<T> extends Buildable {
    or: ConditionFunction<T>;
    and: ConditionFunction<T>;
    if: ConditionFunction<T>;
}
export declare const condition: <T>(conditionNodes?: CompositeNode) => ConditionsBuilder<T>;
