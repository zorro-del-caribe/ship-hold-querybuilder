import {
    compositeNode,
    expressionNode,
    valueNode,
    pointerNode,
    identityNode,
    CompositeNode, NodeParam, Buildable,
} from '../lib/nodes';
import {fluentMethod, isBuildable} from '../lib/util';

export const enum SQLComparisonOperator {
    EQUAL = '=',
    LOWER_THAN = '<',
    LOWER_THAN_OR_EQUAL = '<=',
    GREATER_THAN = '>',
    GREATER_THAN_OR_EQUAL = '>='
}

export interface ConditionsBuilder extends Buildable {
    or(...args: NodeParam<any>[]): ConditionsBuilder;

    and(...args: NodeParam<any>[]): ConditionsBuilder;

    if(leftOperand: NodeParam<any>, operator ?: SQLComparisonOperator, rightOperand?: NodeParam<any>): ConditionsBuilder;
}

export default (conditionNodes: CompositeNode = compositeNode()): ConditionsBuilder => {
    return {
        or(...args: NodeParam<any>[]) {
            conditionNodes.add(identityNode('OR'));
            return this.if(...args);
        },
        and(...args: NodeParam<any>[]) {
            conditionNodes.add(identityNode('AND'));
            return this.if(...args);
        },
        if: fluentMethod((leftOperand: NodeParam<any>, operator ?: SQLComparisonOperator, rightOperand ?: NodeParam<any>) => {
            const leftOperandNode = isBuildable(leftOperand) ?
                expressionNode(leftOperand) :
                pointerNode(leftOperand);
            let actualOperator = operator;
            let actualRightOperand = rightOperand;
            if (operator === undefined) {
                conditionNodes.add(leftOperandNode);
            } else {
                if (rightOperand === undefined) {
                    actualRightOperand = operator;
                    actualOperator = SQLComparisonOperator.EQUAL;
                }
                const operatorNode = identityNode(actualOperator);
                const rightOperandNode = isBuildable(actualRightOperand) ?
                    expressionNode(actualRightOperand) :
                    valueNode(actualRightOperand);
                const whereNode = compositeNode()
                    .add(leftOperandNode, operatorNode, rightOperandNode);

                conditionNodes.add(whereNode);
            }
        }),
        build(params = {}, offset = 1) {
            return conditionNodes.build(params, offset);
        }
    };
};
