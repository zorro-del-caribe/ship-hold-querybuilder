import { condition } from '../builders/conditions';
import { compositeNode } from './nodes';
// Create a condition builder proxy which will be revoked as soon as the main builder is called
export default (mainBuilder, nodes) => (leftOperand, operator, rightOperand) => {
    const conditionNodes = compositeNode();
    const delegate = condition(conditionNodes)
        .if(leftOperand, operator, rightOperand);
    const revocable = Proxy.revocable(delegate, {
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
