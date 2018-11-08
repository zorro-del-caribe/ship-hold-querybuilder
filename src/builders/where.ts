import proxy from '../lib/proxy-condition';
import {nodeSymbol} from './clause';
import {Buildable, NodeParam} from '../lib/nodes';
import {ConditionsBuilder, SQLComparisonOperator} from './conditions';

export default function <T extends Buildable>(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand ?: NodeParam<any>): ConditionsBuilder<T> & T {
    return proxy<T>(this, this[nodeSymbol].where)(leftOperand, operator, rightOperand);
}
