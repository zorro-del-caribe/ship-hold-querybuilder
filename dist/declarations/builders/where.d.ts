import { NodeParam } from '../lib/nodes';
import { ConditionsBuilder, SQLComparisonOperator } from './conditions';
export default function (leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand?: NodeParam<any>): ConditionsBuilder;
