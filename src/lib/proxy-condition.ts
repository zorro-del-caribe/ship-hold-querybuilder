import {ConditionsBuilder, condition, SQLComparisonOperator} from '../builders/conditions';
import {Buildable, CompositeNode, compositeNode, NodeParam} from './nodes';

// Create a condition builder proxy which will be revoked as soon as the main builder is called
export default <T extends Buildable>(mainBuilder: T, nodes: CompositeNode) => (leftOperand: NodeParam<any>, operator ?: SQLComparisonOperator, rightOperand ?: NodeParam<any>): ConditionsBuilder<T> & T => {
    const conditionNodes = compositeNode();
    const delegate = condition<T>(conditionNodes)
        .if(leftOperand, operator, rightOperand);
    const revocable = Proxy.revocable<ConditionsBuilder<T> & T>(delegate, {
        get(target, property) {
            if (target[property] && property !== 'build') {
                return target[property];
            }
            nodes.add(conditionNodes);
            revocable.revoke();
            return mainBuilder[property].bind(mainBuilder);
        }
    });
    return revocable.proxy;
};
