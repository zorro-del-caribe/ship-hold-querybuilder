import conditions from '../builders/conditions';
import {compositeNode} from './nodes';

// Create a condition builder proxy which will be revoked as soon as the main builder is called
export default (mainBuilder, nodes) => (...args) => {
	const conditionNodes = compositeNode();
	const delegate = conditions(conditionNodes)
		.if(...args);
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
