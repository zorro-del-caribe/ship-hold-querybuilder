import proxy from '../lib/proxy-condition';
import { nodeSymbol } from './clause';
import { compositeNode } from '../lib/nodes';
export default function (leftOperand, operator, rightOperand) {
    const nodes = this[nodeSymbol].where;
    let conditionNode = nodes;
    //if we have already some conditions we add the new one as a AND branch
    if (nodes.length) {
        conditionNode = compositeNode();
        nodes.add('AND', '(', conditionNode, ')');
    }
    return proxy(this, conditionNode)(leftOperand, operator, rightOperand);
}
