import {compositeNode} from '../lib/nodes';
import clauseMethod from './clause';
import where from './where';

export default tableName => {
	const usingNodes = compositeNode();
	const tableNodes = compositeNode();
	const whereNodes = compositeNode();

	const instance = {
		from(...args) {
			return this.table(...args);
		},
		where: where(whereNodes),
		table: clauseMethod(tableNodes),
		using: clauseMethod(usingNodes),
		build(params = {}) {
			const queryNode = compositeNode()
				.add('DELETE FROM', tableNodes);

			if (usingNodes.length > 0) {
				queryNode.add('USING', usingNodes);
			}

			if (whereNodes.length > 0) {
				queryNode.add('WHERE', whereNodes);
			}

			return queryNode.build(params);
		}
	};
	if (tableName) {
		instance.from(tableName);
	}
	return instance;
};
