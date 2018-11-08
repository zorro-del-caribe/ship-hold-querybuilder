import { Buildable, NodeParam } from '../lib/nodes';
import { ConditionsBuilder, SQLComparisonOperator } from './conditions';
export default function <T extends Buildable>(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand?: NodeParam<any>): ConditionsBuilder<T> & T;
