import { compositeNode, expressionNode, valueNode, pointerNode, identityNode, } from '../lib/nodes';
import { fluentMethod, isBuildable } from '../lib/util';
export var SQLComparisonOperator;
(function (SQLComparisonOperator) {
    SQLComparisonOperator["EQUAL"] = "=";
    SQLComparisonOperator["LOWER_THAN"] = "<";
    SQLComparisonOperator["LOWER_THAN_OR_EQUAL"] = "<=";
    SQLComparisonOperator["GREATER_THAN"] = ">";
    SQLComparisonOperator["GREATER_THAN_OR_EQUAL"] = ">=";
})(SQLComparisonOperator || (SQLComparisonOperator = {}));
export default (conditionNodes = compositeNode()) => {
    return {
        or(...args) {
            conditionNodes.add(identityNode('OR'));
            return this.if(...args);
        },
        and(...args) {
            conditionNodes.add(identityNode('AND'));
            return this.if(...args);
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
