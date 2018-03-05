import {compositeNode, expressionNode, valueNode, pointerNode, identityNode} from '../lib/nodes';
import {fluentMethod} from '../lib/util';

const isNode = val => val.build && typeof val.build === 'function';

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
		if: fluentMethod((leftOperand, ...args) => {
			const leftOperandNode = isNode(leftOperand) ? expressionNode(leftOperand) : pointerNode(leftOperand);
			if (args.length === 0) {
				conditionNodes.add(leftOperandNode);
			} else {
				if (args.length === 1) {
					args.unshift('=');
				}
				const [operator, rightOperand] = args;
				const operatorNode = identityNode(operator);
				const rightOperandNode = isNode(rightOperand) ? expressionNode(rightOperand) : valueNode(rightOperand);
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
