import {compositeNode, pointerNode, valueNode} from '../lib/nodes';
import where from './where';
import clauseMethod from './clause';
import {fluentMethod} from "../lib/util";

const createSetNode = (prop, value) => compositeNode()
	.add(pointerNode(prop), '=', valueNode(value));

export default tableName => {
	const whereNodes = compositeNode();
	const tableNodes = compositeNode({separator: ', '});
	const returningNodes = compositeNode({separator: ', '});
	const fromNodes = compositeNode({separator: ', '});
	const valueNodes = compositeNode({separator: ', '});
	const instance = {
		where: where(whereNodes),
		returning: clauseMethod(returningNodes),
		from: clauseMethod(fromNodes),
		table: clauseMethod(tableNodes),
		set:fluentMethod((prop, value) => {
			const setNodes = value === undefined ?
				Object.getOwnPropertyNames(prop)
					.map(p => createSetNode(p, prop[p])) :
				[createSetNode(prop, value)];
			valueNodes.add(...setNodes);
		}),
		build(params = {}) {
			const queryNode = compositeNode()
				.add('UPDATE', tableNodes, 'SET', valueNodes);

			if (fromNodes.length > 0) {
				queryNode.add('FROM', fromNodes);
			}

			if (whereNodes.length > 0) {
				queryNode.add('WHERE', whereNodes);
			}

			if (returningNodes.length > 0) {
				queryNode.add('RETURNING', returningNodes);
			}

			return queryNode.build(params);
		}
	};
	instance.table(tableName);
	return instance;
};
