import { ConditionsBuilder, SQLComparisonOperator } from '../builders/conditions';
import { Buildable, CompositeNode, NodeParam } from './nodes';
declare const _default: (mainBuilder: Buildable, nodes: CompositeNode) => (leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand?: NodeParam<any>) => ConditionsBuilder;
export default _default;
