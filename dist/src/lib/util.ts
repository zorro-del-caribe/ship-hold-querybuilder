import {Buildable, CompositeNode, SQLNodeValue} from './nodes';

export const fluentMethod = (fn: Function) => function (...args) {
    fn.bind(this)(...args);
    return this;
};

export const isBuildable = (val: any): val is Buildable => val.build && typeof val.build === 'function';

export const isSQLNodeValue = <T>(val: any): val is SQLNodeValue<T> => val && typeof val.value !== 'undefined';

export const isSubQuery = node => node.value && isBuildable(node.value);

export const identity = val => val;

export const eventuallyAddComposite = (target: CompositeNode) => (composite: CompositeNode, keyword?: string) => {
    if (composite.length) {
        if (keyword) {
            target.add(keyword.toUpperCase());
        }
        target.add(composite);
    }
};
