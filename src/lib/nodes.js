import {fluentMethod} from "./util";
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
export const identityNode = (params = {}) => {
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
export const valueNode = (params = {}) => {
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
export const pointerNode = (params = {}) => {
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
export const expressionNode = function (params = {}) {
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
export const compositeNode = ({separator = ' '} = {
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
