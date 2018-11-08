import { CompositeNode, NodeParam, Buildable } from '../lib/nodes';
export declare const enum SQLComparisonOperator {
    EQUAL = "=",
    LOWER_THAN = "<",
    LOWER_THAN_OR_EQUAL = "<=",
    GREATER_THAN = ">",
    GREATER_THAN_OR_EQUAL = ">="
}
export interface ConditionsBuilder extends Buildable {
    or(...args: NodeParam<any>[]): ConditionsBuilder;
    and(...args: NodeParam<any>[]): ConditionsBuilder;
    if(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand?: NodeParam<any>): ConditionsBuilder;
}
declare const _default: (conditionNodes?: CompositeNode) => ConditionsBuilder;
export default _default;
