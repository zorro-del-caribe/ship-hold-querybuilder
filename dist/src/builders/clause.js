import { fluentMethod, selectLikeExpression } from '../lib/util';
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
            this[nodeSymbol][name].add(...args.map(selectLikeExpression)); // Technically not all the clause would accept fromable
        });
    }
    return api;
};
