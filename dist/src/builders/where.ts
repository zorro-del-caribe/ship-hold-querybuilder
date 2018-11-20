import proxy from '../lib/proxy-condition';
import {nodeSymbol} from './clause';
import {compositeNode} from '../lib/nodes';
import {ConditionsBuilder, SQLComparisonOperator} from './conditions';
import {Buildable, NodeParam} from '../lib/node-interfaces';

export default function <T extends Buildable>(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand ?: NodeParam<any>): ConditionsBuilder<T> & T {
    const nodes = this[nodeSymbol].where;
    let conditionNode = nodes;

    //if we have already some conditions we add the new one as a AND branch
    if (nodes.length) {
        conditionNode = compositeNode();
        nodes.add('AND', '(', conditionNode, ')');
    }

    return proxy<T>(this, conditionNode)(leftOperand, operator, rightOperand);
}
