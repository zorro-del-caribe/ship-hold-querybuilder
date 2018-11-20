import { ConditionsBuilder, SQLComparisonOperator } from './conditions';
import { Buildable, NodeParam } from '../lib/node-interfaces';
export default function <T extends Buildable>(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand?: NodeParam<any>): ConditionsBuilder<T> & T;
