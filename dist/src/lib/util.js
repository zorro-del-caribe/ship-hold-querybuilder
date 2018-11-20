import { expressionNode, pointerNode } from './nodes';
export const fluentMethod = (fn) => function (...args) {
    fn.bind(this)(...args);
    return this;
};
export const isBuildable = (val) => val.build && typeof val.build === 'function';
export const isSQLNodeValue = (val) => val && typeof val.value !== 'undefined';
export const isFunctionNode = (val) => val.functionName !== undefined;
export const identity = val => val;
export const selectLikeExpression = (val) => {
    if (isBuildable(val)) {
        // function call node
        if (isFunctionNode(val)) {
            return val;
        }
        // expression
        return expressionNode(val);
    }
    if (typeof val === 'string') {
        return pointerNode(val);
    }
    if (isSQLNodeValue(val)) {
        return isBuildable(val.value) ? expressionNode(val) : pointerNode(val);
    }
    throw new Error(`${val} is not a FromAble`);
};
export const eventuallyAddComposite = (target) => (composite, keyword) => {
    if (composite.length) {
        if (keyword) {
            target.add(keyword.toUpperCase());
        }
        target.add(composite);
    }
};
