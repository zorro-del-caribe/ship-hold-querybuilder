import proxy from '../lib/proxy-condition';
import {nodeSymbol} from './clause';
import {NodeParam} from '../lib/nodes';
import {ConditionsBuilder, SQLComparisonOperator} from './conditions';

export default function (leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand ?: NodeParam<any>): ConditionsBuilder {
    return proxy(this, this[nodeSymbol].where)(leftOperand, operator, rightOperand);
}
