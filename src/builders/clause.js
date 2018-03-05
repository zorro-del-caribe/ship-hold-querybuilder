import {expressionNode, pointerNode} from '../lib/nodes';

export const nodeSymbol = Symbol('nodes');

const isSubQuery = node => node.value && typeof node.value.build === 'function';
export const clauseMixin = (...names) => {
	const api = {
		node(name, newNode) {
			const node = this[nodeSymbol][name];
			if(newNode === undefined){
				return node;
			}
			return this[nodeSymbol][name] = newNode;
		}
	};
	for (const name of names) {
		api[name] = function (...args) {
			this[nodeSymbol][name].add(...args.map(n => isSubQuery(n) ? expressionNode(n) : pointerNode(n)));
			return this;
		};
	}
	return api;
};
