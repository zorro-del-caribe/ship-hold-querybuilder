import {compositeNode} from '../lib/nodes';
import {clauseMixin, nodeSymbol} from './clause';
import where from './where';

const proto = Object.assign({
	where,
	from(...args) {
		return this.table(...args);
	},
	build(params = {}) {
		const {table, using, where} = this[nodeSymbol];
		const queryNode = compositeNode()
			.add('DELETE FROM', table);

		if (using.length > 0) {
			queryNode.add('USING', using);
		}

		if (where.length > 0) {
			queryNode.add('WHERE', where);
		}

		return queryNode.build(params);
	}
}, clauseMixin('table', 'using'));

export default tableName => {
	const instance = Object.create(proto, {
		[nodeSymbol]: {
			value: {
				using: compositeNode(),
				table: compositeNode(),
				where: compositeNode()
			}
		}
	});

	if (tableName) {
		instance.from(tableName);
	}
	return instance;
};
