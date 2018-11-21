import {fluentMethod, identity, isBuildable, isFunctionNode, isSQLNodeValue} from './util';
import {
    SQLNode,
    Buildable,
    NodeParam,
    CompositeNodeMember,
    SQLNodeValue,
    CompositeNodeFactoryInput,
    FunctionNode,
    CompositeNode,
    SQLQuery
} from './node-interfaces';

const STAR = '*';
const isParamRegexp = /^\$/;

const buildStringMethodFactory = (fn: Function) => function (this: SQLNode<string>, params, offset): SQLQuery {
    const {node: {value}} = this;
    const isParam = isParamRegexp.test(value);
    const text = isParam ? '$' + offset : fn(value);
    const values: any[] = isParam ? [params[value.substr(1)]] : [];
    return {text, values};
};

const isWrappedRegexp = /'(.*)'|"(.*)"|\((.*)\)|^\$/;
const testWrap = (input: string): boolean => isWrappedRegexp.test(input);
const wrap = (string: string, quote = '"'): string => (testWrap(string) || string === STAR) ? string : quote + string + quote;
const parseValue = (value: any): string => {
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
            // Dates
            if (value.toISOString) {
                return wrap(value.toISOString(), `'`);
            }
            return `'${JSON.stringify(value)}'`;
        }
        default:
            return value;
    }
};

const pointerNodeProto = {
    build(this: SQLNode<string>, params, offset) {
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
        const text = node.as ? `${val} AS ${wrap(node.as)}` : val;
        return {text, values: []};
    },
    map(fn) {
        return pointerNode(fn(this.node.value));
    }
};

const expressionNodeProto = {
    build(this: SQLNode<Buildable>, params, offset) {
        const {node} = this;
        const {text, values} = node.value.build(params, offset);
        const fullText = node.as ? [`(${text})`, 'AS', wrap(node.as)].join(' ') : `(${text})`;
        return {text: fullText, values};
    },
    map(fn) {
        return expressionNode(fn(this.node.value));
    }
};

const identityNodeProto = {
    build: buildStringMethodFactory(identity),
    map(fn) {
        return identityNode(fn(this.node.value));
    }
};

// SQLNode that returns its own value when built
export const identityNode = <T>(params: NodeParam<T>): SQLNode<T | string> => {
    const node = isSQLNodeValue<string>(params) === false ? {value: params} : params;
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
            yield n.node ? n.node : n;
        }
    },
    add: fluentMethod(function (this: CompositeNode, ...args: (CompositeNodeMember)[]) {
        const nodeArgs = args.map(n => isBuildable(n) ? n : identityNode(n));
        this.nodes.push(...nodeArgs);
    }),
    build(params, offset) {
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

const valueNodeProto = {
    build: buildStringMethodFactory(parseValue),
    map(fn) {
        return valueNode(fn(this.node.value));
    }
};

// SQLNode that returns a scalar value when built
export const valueNode = <T>(params: NodeParam<T>): SQLNode<T> => {
    const node = isSQLNodeValue<T>(params) ? params : {value: params};
    return Object.create(valueNodeProto, {
        node: {
            get() {
                return Object.assign({}, node);
            }
        }
    });
};

// SQLNode that returns a sql identifier when built
export const pointerNode = (params: NodeParam<string>): SQLNode<string> => {
    const node = isSQLNodeValue<string>(params) ? params : {value: params};
    return Object.create(pointerNodeProto, {
        node: {
            get() {
                return Object.assign({}, node);
            }
        }
    });
};

// SQLNode made from a sub builder (for subquery)
export const expressionNode = (params: SQLNodeValue<Buildable> | Buildable): SQLNode<Buildable> => {
    const node = isSQLNodeValue(params) ? params : {value: params};
    return Object.create(expressionNodeProto, {
        node: {
            get() {
                return Object.assign({}, node);
            }
        }
    });
};

// SQLNode made of nodes
export const compositeNode = ({separator = ' '}: CompositeNodeFactoryInput = {
    separator: ' '
}): CompositeNode => Object.create(compositeNodeProto, {
    nodes: {value: []},
    length: {
        get() {
            return this.nodes.length;
        }
    },
    separator: {value: separator}
});

const functionNodeProto = {
    add: fluentMethod(function (this: FunctionNode, ...args: any[]) {
        this.args.push(...args.map(val => {
            return isFunctionNode(val) ? val : valueNode(val);
        }));
    }),
    build(this: FunctionNode, params, offset) {
        const argsNode = compositeNode({separator: ','});
        for (const node of this.args) {
            argsNode.add(node);
        }
        const {text: argText, values} = argsNode.build(params, offset);
        const functionCall = `${this.functionName}(${argText})`;
        const text = this.alias !== undefined ? `${functionCall} AS "${this.alias}"` : functionCall;
        return {
            text,
            values
        };
    }
};

export const functionNode = (fnName: string, alias ?: string): FunctionNode => {
    return Object.create(functionNodeProto, {
        functionName: {value: fnName},
        args: {value: []},
        alias: {value: alias}
    });
};
