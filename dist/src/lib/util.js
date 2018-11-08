export const fluentMethod = (fn) => function (...args) {
    fn.bind(this)(...args);
    return this;
};
export const isBuildable = (val) => val.build && typeof val.build === 'function';
export const isSQLNodeValue = (val) => val && typeof val.value !== 'undefined';
export const isSubQuery = node => node.value && isBuildable(node.value);
export const identity = val => val;
