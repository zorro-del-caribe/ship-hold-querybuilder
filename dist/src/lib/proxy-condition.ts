import {ConditionsBuilder, condition, SQLComparisonOperator} from '../builders/conditions';
import {compositeNode} from './nodes';
import {Buildable, NodeParam, CompositeNode} from './node-interfaces';

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
            return typeof mainBuilder[property] === 'function' ?
                mainBuilder[property].bind(mainBuilder) :
                mainBuilder[property];
        }
    });
    return revocable.proxy;
};
