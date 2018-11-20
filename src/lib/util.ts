import {expressionNode, pointerNode} from './nodes';
import {Buildable, NodeParam, SQLNodeValue, CompositeNode, FunctionNode} from './node-interfaces';

export const fluentMethod = (fn: Function) => function (...args) {
    fn.bind(this)(...args);
    return this;
};

export const isBuildable = (val: any): val is Buildable => val.build && typeof val.build === 'function';

export const isSQLNodeValue = <T>(val: any): val is SQLNodeValue<T> => val && typeof val.value !== 'undefined';

export const isFunctionNode = (val: any): val is FunctionNode => val.functionName !== undefined;

export const identity = val => val;

export type SelectLikeExpression = NodeParam<string | Buildable> | Buildable;

export const selectLikeExpression = (val: SelectLikeExpression) => {
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
        return isBuildable(val.value) ? expressionNode(<SQLNodeValue<Buildable>>val) : pointerNode(<SQLNodeValue<any>>val);
    }

    throw new Error(`${val} is not a FromAble`);
};

export const eventuallyAddComposite = (target: CompositeNode) => (composite: CompositeNode, keyword?: string) => {
    if (composite.length) {
        if (keyword) {
            target.add(keyword.toUpperCase());
        }
        target.add(composite);
    }
};
