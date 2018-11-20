import {
    compositeNode,
    expressionNode,
    valueNode,
    pointerNode,
    identityNode,
} from '../lib/nodes';
import {fluentMethod, isBuildable} from '../lib/util';
import {Buildable, CompositeNode} from '../lib/node-interfaces';

export const enum SQLComparisonOperator {
    EQUAL = '=',
    LOWER_THAN = '<',
    LOWER_THAN_OR_EQUAL = '<=',
    GREATER_THAN = '>',
    GREATER_THAN_OR_EQUAL = '>=',
    NOT_EQUAL = '<>',
    IS = 'IS',
    IS_NOT = 'IS NOT',
    BETWEEN = 'BETWEEN',
    NOT_BETWEEN = 'NOT BETWEEN',
    BETWEEN_SYMETRIC = 'BETWEEN SYMETRIC',
    NOT_BETWEEN_SYMETRIC = 'NOT BETWEEN SYMETRIC',
    IS_DISTINCT = 'IS DISTINCT',
    IS_NOT_DISTINCT = 'IS NOT DISTINCT',
    LIKE = 'LIKE',
    ILIKE = 'ILIKE',
    CONTAINS = '@>',
    IS_CONTAINED_BY = '<@',
    OVERLAP = '&&',
    CONCATENATE = '||'
}

export interface ConditionFunction<T> {
    (leftOperand: any, operator ?: any, rightOperand?: any): ConditionsBuilder<T> & T;
}

export interface ConditionsBuilder<T> extends Buildable {
    or: ConditionFunction<T>;

    and: ConditionFunction<T>;

    if: ConditionFunction<T>;
}

export const condition = <T>(conditionNodes: CompositeNode = compositeNode()): ConditionsBuilder<T> => {
    return {
        or(this: ConditionsBuilder<T>, leftOperand, operator, rightOperand) {
            conditionNodes.add(identityNode('OR'));
            return this.if(leftOperand, operator, rightOperand);
        },
        and(this: ConditionsBuilder<T>, leftOperand, operator, rightOperand) {
            conditionNodes.add(identityNode('AND'));
            return this.if(leftOperand, operator, rightOperand);
        },
        if: fluentMethod((leftOperand, operator, rightOperand) => {
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
        build(this: ConditionsBuilder<T>, params = {}, offset = 1) {
            return conditionNodes.build(params, offset);
        }
    };
};
