import {compositeNode, valueNode, identityNode, pointerNode, expressionNode} from '../lib/nodes';
import proxy from '../lib/proxy-condition';
import clauseMethod from './clause';
import where from './where';
import {fluentMethod} from "../lib/util";

const joinFunc = (joinType, joinNodes) => function (table, leftOperand, rightOperand) {
	const isSubQuery = node => node.value && typeof node.value.build === 'function';
	const node = isSubQuery(table) ? expressionNode(table) : pointerNode(table);
	joinNodes.add(identityNode(joinType), node);
	return leftOperand && rightOperand ? this.on(leftOperand, rightOperand) : this;
};

export default (...args) => {
	const nodes = {
		orderBy: compositeNode({separator: ', '}),
		limit: compositeNode(),
		join: compositeNode(),
		from: compositeNode({separator: ', '}),
		select: compositeNode({separator: ', '}),
		where: compositeNode()
	};

	const instance = {
		node(name, newNode) {
			if (nodes[name] === undefined) {
				throw new Error('Unknown node type');
			}
			return nodes[name] = newNode === undefined ? nodes[name] : newNode;
		},
		join: joinFunc('JOIN', nodes.join),
		leftJoin: joinFunc('LEFT JOIN', nodes.join),
		rightJoin: joinFunc('RIGHT JOIN', nodes.join),
		fullJoin: joinFunc('FULL JOIN', nodes.join),
		on(...args) {
			// Todo throw exception if last join nodes is not a identity node
			nodes.join.add('ON');
			return proxy(this, nodes.join)(...args);
		},
		orderBy: fluentMethod((column, direction) => {
			const newOrderByNode = compositeNode();
			newOrderByNode.add(pointerNode(column));
			const actualDirection = ((direction && direction.toString()) || '').toUpperCase();
			if (actualDirection === 'ASC' || actualDirection === 'DESC') {
				newOrderByNode.add(identityNode(actualDirection));
			}
			nodes.orderBy.add(newOrderByNode);
		}),
		limit: fluentMethod((l, offset) => {
			nodes.limit.add(valueNode(l));
			if (offset) {
				nodes.limit.add(identityNode('OFFSET'), valueNode(offset));
			}
		}),
		noop: fluentMethod(() => {}),
		where: where(nodes.where),
		from: clauseMethod(nodes.from),
		select: clauseMethod(nodes.select),
		build(params = {}) {
			const queryNode = compositeNode();

			const eventuallyAdd = (composite, keyWord) => {
				if (composite.length > 0) {
					queryNode.add(keyWord.toUpperCase(), composite);
				}
			};

			eventuallyAdd(nodes.select, 'select');
			eventuallyAdd(nodes.from, 'from');
			if (nodes.join.length > 0) {
				queryNode.add(nodes.join);
			}
			eventuallyAdd(nodes.where, 'where');
			eventuallyAdd(nodes.orderBy, 'order by');
			eventuallyAdd(nodes.limit, 'limit');
			return queryNode.build(params);
		}
	};

	if (args.length === 0) {
		args.push('*');
	}

	return instance
		.select(...args);
};
