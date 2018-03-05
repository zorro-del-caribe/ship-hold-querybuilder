'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const aggregateFunc = fn => (field, label = fn) => ({value: field, as: label, fn: fn.toUpperCase()});
const count = aggregateFunc('count');
const avg = aggregateFunc('avg');
const sum = aggregateFunc('sum');


var aggregations = Object.freeze({
	count: count,
	avg: avg,
	sum: sum
});

const STAR = '*';
const isParamRegexp = /^\$/;

const buildMethodFactory = fn => function (params = {}, offset = 1) {
	const {node: {value}} = this;
	const isParam = isParamRegexp.test(value);
	const text = isParam === true ? '$' + offset : fn(value);
	const values = isParam === true ? [params[value.substr(1)]] : [];
	return {text, values};
};

const identityNodeProto = {
	build: buildMethodFactory(val => val)
};

const isWrappedRegexp = /'(.*)'|"(.*)"|\((.*)\)|^\$/;
const testWrap = input => isWrappedRegexp.test(input);
const wrap = (string, quote = '"') => (testWrap(string) || string === STAR) ? string : quote + string + quote;
const parseValue = value => {
	switch (typeof value) {
		case 'string':
			return wrap(value, `'`);
		case 'object': {
			if (value === null) {
				return 'NULL';
			}
			if (Array.isArray(value)) {
				return '(' + value.map(parseValue).join(',') + ')';
			}
			if (value.toISOString) {
				return wrap(value.toISOString(), `'`);
			}
			return `'${JSON.stringify(value)}'`;
		}
		default:
			return value;
	}
};
const valueNodeProto = {
	build: buildMethodFactory(parseValue)
};

const pointerNodeProto = {
	build() {
		const {node} = this;
		let val;
		if (testWrap(node.value)) {
			val = node.value;
		} else {
			const [first, ...rest] = node.value.split('.');
			const parts = [wrap(first)];
			if (rest.length > 0) {
				parts.push(wrap(rest.join('.')));
			}
			val = parts.join('.');
		}
		const value = node.fn ? `${node.fn}(${val})` : val;
		const text = node.as ? [value, 'AS', wrap(node.as)].join(' ') : value;
		return {text, values: []};
	}
};

const expressionNodeProto = {
	build(params = {}, offset = 1) {
		const {node} = this;
		const {text, values} = node.value.build(params, offset);
		const fullText = node.as ? [`(${text})`, 'AS', wrap(node.as)].join(' ') : `(${text})`;
		return {text: fullText, values};
	}
};

// Node that returns its own value when built
const identityNode = (params = {}) => {
	const node = params.value === undefined ? {value: params} : params;
	return Object.create(identityNodeProto, {
		node: {
			get() {
				return Object.assign({}, node);
			}
		}
	});
};

const compositeNodeProto = {
	* [Symbol.iterator]() {
		for (const n of this.nodes) {
			if (n[Symbol.iterator] === undefined) {
				yield n.node;
			} else {
				yield * n;
			}
		}
	},
	add(...args) {
		const nodeArgs = args.map(n => typeof n.build === 'function' ? n : identityNode(n));
		this.nodes.push(...nodeArgs);
		return this;
	},
	build(params = {}, offset = 1) {
		let off = offset;
		const text = [];
		const values = [];
		for (const node of this.nodes) {
			const {text: newText, values: newVals = []} = node.build(params, off);
			text.push(newText);
			values.push(...newVals);
			off += newVals.length;
		}
		return {
			text: text.join(this.separator),
			values
		};
	}
};

// Node that returns a scalar value when built
const valueNode = (params = {}) => {
	const node = params === null || params.value === undefined ? {value: params} : params;
	return Object.create(valueNodeProto, {
		node: {
			get() {
				return Object.assign({}, node);
			}
		}
	});
};

// Node that returns a sql identifier when built
const pointerNode = (params = {}) => {
	const node = params.value === undefined ? {value: params} : params;
	return Object.create(pointerNodeProto, {
		node: {
			get() {
				return Object.assign({}, node);
			}
		}
	});
};

// Node made from a sub builder (for subquery)
const expressionNode = function (params = {}) {
	const node = params.value === undefined ? {value: params} : params;
	return Object.create(expressionNodeProto, {
		node: {
			get() {
				return Object.assign({}, node);
			}
		}
	});
};

// Node made of nodes
const compositeNode = ({separator = ' '} = {
	separator: ' ',
	type: 'unknown composite'
}) => Object.create(compositeNodeProto, {
	nodes: {value: []},
	length: {
		get() {
			return this.nodes.length;
		}
	},
	separator: {value: separator}
});


var nodeFactories = Object.freeze({
	identityNode: identityNode,
	valueNode: valueNode,
	pointerNode: pointerNode,
	expressionNode: expressionNode,
	compositeNode: compositeNode
});

const fluentMethod = fn => function (...args) {
	fn.bind(this)(...args);
	return this;
};

const isNode = val => val.build && typeof val.build === 'function';

var conditions = (conditionNodes = compositeNode()) => {
	return {
		or(...args) {
			conditionNodes.add(identityNode('OR'));
			return this.if(...args);
		},
		and(...args) {
			conditionNodes.add(identityNode('AND'));
			return this.if(...args);
		},
		if: fluentMethod((leftOperand, ...args) => {
			const leftOperandNode = isNode(leftOperand) ? expressionNode(leftOperand) : pointerNode(leftOperand);
			if (args.length === 0) {
				conditionNodes.add(leftOperandNode);
			} else {
				if (args.length === 1) {
					args.unshift('=');
				}
				const [operator, rightOperand] = args;
				const operatorNode = identityNode(operator);
				const rightOperandNode = isNode(rightOperand) ? expressionNode(rightOperand) : valueNode(rightOperand);
				const whereNode = compositeNode()
					.add(leftOperandNode, operatorNode, rightOperandNode);

				conditionNodes.add(whereNode);
			}
		}),
		build(params = {}, offset = 1) {
			return conditionNodes.build(params, offset);
		}
	};
};

// Create a condition builder proxy which will be revoked as soon as the main builder is called
var proxy = (mainBuilder, nodes) => (...args) => {
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

const nodeSymbol = Symbol('nodes');

const isSubQuery = node => node.value && typeof node.value.build === 'function';
const clauseMixin = (...names) => {
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

function where (...args) {
	return proxy(this, this[nodeSymbol].where)(...args);
}

const joinFunc = joinType => function (table, leftOperand, rightOperand) {
	const isSubQuery = node => node.value && typeof node.value.build === 'function';
	const node = isSubQuery(table) ? expressionNode(table) : pointerNode(table);
	this[nodeSymbol].join.add(identityNode(joinType), node);
	return leftOperand && rightOperand ? this.on(leftOperand, rightOperand) : this;
};

const proto = Object.assign({
	join: joinFunc('JOIN'),
	leftJoin: joinFunc('LEFT JOIN'),
	rightJoin: joinFunc('RIGHT JOIN'),
	fullJoin: joinFunc('FULL JOIN'),
	on(...args) {
		// Todo throw exception if last join nodes is not a identity node
		const {join} = this[nodeSymbol];
		join.add('ON');
		return proxy(this, join)(...args);
	},
	orderBy: fluentMethod(function (column, direction) {
		const newOrderByNode = compositeNode();
		newOrderByNode.add(pointerNode(column));
		const actualDirection = ((direction && direction.toString()) || '').toUpperCase();
		if (actualDirection === 'ASC' || actualDirection === 'DESC') {
			newOrderByNode.add(identityNode(actualDirection));
		}
		this[nodeSymbol].orderBy.add(newOrderByNode);
	}),
	limit: fluentMethod(function (l, offset) {
		this[nodeSymbol].limit.add(valueNode(l));
		if (offset) {
			this[nodeSymbol].limit.add(identityNode('OFFSET'), valueNode(offset));
		}
	}),
	noop: fluentMethod(() => {}),
	where,
	build(params = {}) {
		const queryNode = compositeNode();
		const nodes = this[nodeSymbol];

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
}, clauseMixin('from', 'select'));

var select = (...args) => {
	const nodes = {
		orderBy: compositeNode({separator: ', '}),
		limit: compositeNode(),
		join: compositeNode(),
		from: compositeNode({separator: ', '}),
		select: compositeNode({separator: ', '}),
		where: compositeNode()
	};

	const instance = Object.create(proto, {[nodeSymbol]: {value: nodes}});

	if (args.length === 0) {
		args.push('*');
	}

	return instance
		.select(...args);
};

const createSetNode = (prop, value) => compositeNode()
	.add(pointerNode(prop), '=', valueNode(value));

const proto$1 = Object.assign({
	where,
	set: fluentMethod(function (prop, value) {
		const setNodes = value === undefined ?
			Object.getOwnPropertyNames(prop)
				.map(p => createSetNode(p, prop[p])) :
			[createSetNode(prop, value)];
		this[nodeSymbol].values.add(...setNodes);
	}),
	build(params = {}) {
		const {table, values, from, where: where$$1, returning} = this[nodeSymbol];

		const queryNode = compositeNode()
			.add('UPDATE', table, 'SET', values);

		if (from.length > 0) {
			queryNode.add('FROM', from);
		}

		if (where$$1.length > 0) {
			queryNode.add('WHERE', where$$1);
		}

		if (returning.length > 0) {
			queryNode.add('RETURNING', returning);
		}

		return queryNode.build(params);
	}
}, clauseMixin('returning', 'from', 'table'));

var update = tableName => {
	const instance = Object.create(proto$1, {
		[nodeSymbol]: {
			value: {
				where: compositeNode(),
				table: compositeNode({separator: ', '}),
				returning: compositeNode({separator: ', '}),
				from: compositeNode({separator: ', '}),
				values: compositeNode({separator: ', '})
			}
		}
	});
	instance.table(tableName);
	return instance;
};

const proto$2 = Object.assign({
	value: fluentMethod(function (prop, value) {
		this.field(prop);
		this[nodeSymbol].values.add(value === undefined ? identityNode('DEFAULT') : valueNode(value));
	}),
	build(params = {}) {
		const queryNode = compositeNode();
		const {into, field, values, returning} = this[nodeSymbol];
		queryNode.add('INSERT INTO', into, '(', field, ')', 'VALUES', '(', values, ')');
		if (returning.length > 0) {
			queryNode.add('RETURNING', returning);
		}
		return queryNode.build(params);
	}
}, clauseMixin('into', 'field', 'returning'));

var insert = (map = {}) => {
	const instance = Object.create(proto$2, {
		[nodeSymbol]: {
			value: {
				into: compositeNode({separator: ', '}),
				field: compositeNode({separator: ', '}),
				returning: compositeNode({separator: ', '}),
				values: compositeNode({separator: ', '})
			}
		}
	});

	for (const [key, value] of Object.entries(map)) {
		instance.value(key, value);
	}

	return instance;
};

const proto$3 = Object.assign({
	where,
	from(...args) {
		return this.table(...args);
	},
	build(params = {}) {
		const {table, using, where: where$$1} = this[nodeSymbol];
		const queryNode = compositeNode()
			.add('DELETE FROM', table);

		if (using.length > 0) {
			queryNode.add('USING', using);
		}

		if (where$$1.length > 0) {
			queryNode.add('WHERE', where$$1);
		}

		return queryNode.build(params);
	}
}, clauseMixin('table', 'using'));

var _delete = tableName => {
	const instance = Object.create(proto$3, {
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

const nodes = nodeFactories;
const aggregate = aggregations;

exports.nodes = nodes;
exports.aggregate = aggregate;
exports.condition = conditions;
exports.select = select;
exports.update = update;
exports.insert = insert;
exports.delete = _delete;