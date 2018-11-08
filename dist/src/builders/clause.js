import { expressionNode, pointerNode } from '../lib/nodes';
import { fluentMethod, isSubQuery } from '../lib/util';
export const nodeSymbol = Symbol('nodes');
export const clauseMixin = (...names) => {
    const api = {
        node(name, newNode) {
            const node = this[nodeSymbol][name];
            if (newNode === undefined) {
                return node;
            }
            return this[nodeSymbol][name] = newNode;
        }
    };
    for (const name of names) {
        api[name] = fluentMethod(function (...args) {
            this[nodeSymbol][name].add(...args.map(n => isSubQuery(n) ? expressionNode(n) : pointerNode(n)));
        });
    }
    return api;
};
