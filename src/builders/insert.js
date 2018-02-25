import {compositeNode, identityNode, valueNode} from '../lib/nodes';
import clauseMethod from './clause';
import {fluentMethod} from "../lib/util";

export default (map = {}) => {
	const intoNodes = compositeNode({separator: ', '});
	const fieldNodes = compositeNode({separator: ', '});
	const returningNodes = compositeNode({separator: ', '});
	const valueNodes = compositeNode({separator: ', '});
	const instance = {
		into: clauseMethod(intoNodes),
		field: clauseMethod(fieldNodes),
		returning: clauseMethod(returningNodes),
		value: fluentMethod((prop, value) => {
			instance.field(prop);
			valueNodes.add(value === undefined ? identityNode('DEFAULT') : valueNode(value));
		}),
		build(params = {}) {
			const queryNode = compositeNode();
			queryNode.add('INSERT INTO', intoNodes, '(', fieldNodes, ')', 'VALUES', '(', valueNodes, ')');
			if (returningNodes.length > 0) {
				queryNode.add('RETURNING', returningNodes);
			}
			return queryNode.build(params);
		}
	};

	for (const [key, value] of Object.entries(map)) {
		instance.value(key, value);
	}

	return instance;
};
