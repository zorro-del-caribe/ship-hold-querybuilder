import { compositeNode, expressionNode, valueNode, pointerNode, identityNode, } from '../lib/nodes';
import { fluentMethod, isBuildable } from '../lib/util';
export var SQLComparisonOperator;
(function (SQLComparisonOperator) {
    SQLComparisonOperator["EQUAL"] = "=";
    SQLComparisonOperator["LOWER_THAN"] = "<";
    SQLComparisonOperator["LOWER_THAN_OR_EQUAL"] = "<=";
    SQLComparisonOperator["GREATER_THAN"] = ">";
    SQLComparisonOperator["GREATER_THAN_OR_EQUAL"] = ">=";
    SQLComparisonOperator["NOT_EQUAL"] = "<>";
    SQLComparisonOperator["IS"] = "IS";
    SQLComparisonOperator["IS_NOT"] = "IS NOT";
    SQLComparisonOperator["BETWEEN"] = "BETWEEN";
    SQLComparisonOperator["NOT_BETWEEN"] = "NOT BETWEEN";
    SQLComparisonOperator["BETWEEN_SYMETRIC"] = "BETWEEN SYMETRIC";
    SQLComparisonOperator["NOT_BETWEEN_SYMETRIC"] = "NOT BETWEEN SYMETRIC";
    SQLComparisonOperator["IS_DISTINCT"] = "IS DISTINCT";
    SQLComparisonOperator["IS_NOT_DISTINCT"] = "IS NOT DISTINCT";
    SQLComparisonOperator["LIKE"] = "LIKE";
    SQLComparisonOperator["ILIKE"] = "ILIKE";
    SQLComparisonOperator["CONTAINS"] = "@>";
    SQLComparisonOperator["IS_CONTAINED_BY"] = "<@";
    SQLComparisonOperator["OVERLAP"] = "&&";
    SQLComparisonOperator["CONCATENATE"] = "||";
    SQLComparisonOperator["IN"] = "IN";
})(SQLComparisonOperator || (SQLComparisonOperator = {}));
export const condition = (conditionNodes = compositeNode()) => {
    return {
        or(leftOperand, operator, rightOperand) {
            conditionNodes.add(identityNode('OR'));
            return this.if(leftOperand, operator, rightOperand);
        },
        and(leftOperand, operator, rightOperand) {
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
            }
            else {
                if (rightOperand === undefined) {
                    actualRightOperand = operator;
                    actualOperator = "=" /* EQUAL */;
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
