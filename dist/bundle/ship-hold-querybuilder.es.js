const fluentMethod = (fn) => function (...args) {
    fn.bind(this)(...args);
    return this;
};
const isBuildable = (val) => val !== null && val.build && typeof val.build === 'function';
const isSQLNodeValue = (val) => val && typeof val.value !== 'undefined';
const isFunctionNode = (val) => val.functionName !== undefined;
const identity = val => val;
const selectLikeExpression = (val) => {
    if (isBuildable(val)) {
        // function call node
        if (isFunctionNode(val)) {
            return val;
        }
        // expression
        return expressionNode(val);
    }
    if (typeof val === 'string') {
        return pointerNode(val);
    }
    if (isSQLNodeValue(val)) {
        return isBuildable(val.value) ? expressionNode(val) : pointerNode(val);
    }
    throw new Error(`${val} is not a FromAble`);
};
const eventuallyAddComposite = (target) => (composite, keyword) => {
    if (composite.length) {
        if (keyword) {
            target.add(keyword.toUpperCase());
        }
        target.add(composite);
    }
};

const STAR = '*';
const isParamRegexp = /^\$/;
const buildStringMethodFactory = (fn) => function (params, offset) {
    const { node: { value } } = this;
    const isParam = isParamRegexp.test(value);
    const text = isParam ? '$' + offset : fn(value);
    const values = isParam ? [params[value.substr(1)]] : [];
    return { text, values };
};
const isWrappedRegexp = /'(.*)'|"(.*)"|\((.*)\)|^\$/;
const testWrap = (input) => isWrappedRegexp.test(input);
const wrap = (string, quote = '"') => (testWrap(string) || string === STAR) ? string : quote + string + quote;
const parseValue = (value) => {
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
const mapIdentityClone = {
    clone() {
        return this.map(identity);
    }
};
const pointerNodeProto = Object.assign({
    build(params, offset) {
        const { node } = this;
        let val;
        if (testWrap(node.value)) {
            val = node.value;
        }
        else {
            const [first, ...rest] = node.value.split('.');
            const parts = [wrap(first)];
            if (rest.length > 0) {
                parts.push(wrap(rest.join('.')));
            }
            val = parts.join('.');
        }
        const text = node.as ? `${val} AS ${wrap(node.as)}` : val;
        return { text, values: [] };
    },
    map(fn) {
        return pointerNode(Object.assign({}, this.node, { value: fn(this.node.value) }));
    }
}, mapIdentityClone);
const expressionNodeProto = {
    build(params, offset) {
        const { node } = this;
        const { text, values } = node.value.build(params, offset);
        const fullText = node.as ? [`(${text})`, 'AS', wrap(node.as)].join(' ') : `(${text})`;
        return { text: fullText, values };
    },
    map(fn) {
        return expressionNode(Object.assign({}, this.node, { value: fn(this.node.value) }));
    },
    clone() {
        return this.map(item => item.clone());
    }
};
const identityNodeProto = Object.assign({
    build: buildStringMethodFactory(identity),
    map(fn) {
        return identityNode(Object.assign({}, this.node, { value: fn(this.node.value) }));
    }
}, mapIdentityClone);
// SQLNode that returns its own value when built
const identityNode = (params) => {
    const node = isSQLNodeValue(params) === false ? { value: params } : params;
    return Object.create(identityNodeProto, {
        node: {
            get() {
                return Object.assign({}, node);
            }
        }
    });
};
const compositeNodeProto = {
    *[Symbol.iterator]() {
        for (const n of this.nodes) {
            yield n.node ? n.node : n;
        }
    },
    add: fluentMethod(function (...args) {
        const nodeArgs = args.map(n => isBuildable(n) ? n : identityNode(n));
        this.nodes.push(...nodeArgs);
    }),
    build(params, offset) {
        let off = offset;
        const text = [];
        const values = [];
        for (const node of this.nodes) {
            const { text: newText, values: newVals = [] } = node.build(params, off);
            text.push(newText);
            values.push(...newVals);
            off += newVals.length;
        }
        return {
            text: text.join(this.separator),
            values
        };
    },
    clone() {
        const clone = compositeNode({ separator: this.separator });
        clone.nodes.push(...this.nodes.map(n => n.clone()));
        return clone;
    }
};
const valueNodeProto = Object.assign({
    build: buildStringMethodFactory(parseValue),
    map(fn) {
        return valueNode(Object.assign({}, this.node, { value: fn(this.node.value) }));
    }
}, mapIdentityClone);
// SQLNode that returns a scalar value when built
const valueNode = (params) => {
    const node = isSQLNodeValue(params) ? params : { value: params };
    return Object.create(valueNodeProto, {
        node: {
            get() {
                return Object.assign({}, node);
            }
        }
    });
};
// SQLNode that returns a sql identifier when built
const pointerNode = (params) => {
    const node = isSQLNodeValue(params) ? params : { value: params };
    return Object.create(pointerNodeProto, {
        node: {
            get() {
                return Object.assign({}, node);
            }
        }
    });
};
// SQLNode made from a sub builder (for subquery)
const expressionNode = (params) => {
    const node = isSQLNodeValue(params) ? params : { value: params };
    return Object.create(expressionNodeProto, {
        node: {
            get() {
                return Object.assign({}, node);
            }
        }
    });
};
// SQLNode made of nodes
const compositeNode = ({ separator = ' ' } = {
    separator: ' '
}) => Object.create(compositeNodeProto, {
    nodes: { value: [] },
    length: {
        get() {
            return this.nodes.length;
        }
    },
    separator: { value: separator }
});
const functionNodeProto = {
    add: fluentMethod(function (...args) {
        this.args.push(...args.map(val => {
            return isFunctionNode(val) ? val : valueNode(val);
        }));
    }),
    build(params, offset) {
        const argsNode = compositeNode({ separator: ',' });
        for (const node of this.args) {
            argsNode.add(node);
        }
        const { text: argText, values } = argsNode.build(params, offset);
        const functionCall = `${this.functionName}(${argText})`;
        const text = this.alias !== undefined ? `${functionCall} AS "${this.alias}"` : functionCall;
        return {
            text,
            values
        };
    },
    clone() {
        const clone = functionNode(this.functionName, this.alias);
        clone.args.push(...this.args.map(i => i.clone()));
        return clone;
    }
};
const functionNode = (fnName, alias) => {
    return Object.create(functionNodeProto, {
        functionName: { value: fnName },
        args: { value: [] },
        alias: { value: alias }
    });
};

var SQLComparisonOperator;
(function (SQLComparisonOperator) {
    SQLComparisonOperator["EQUAL"] = "=";
    SQLComparisonOperator["LOWER_THAN"] = "<";
    SQLComparisonOperator["LOWER_THAN_OR_EQUAL"] = "<=";
    SQLComparisonOperator["GREATER_THAN"] = ">";
    SQLComparisonOperator["GREATER_THAN_OR_EQUAL"] = ">=";
    SQLComparisonOperator["NOT_EQUAL"] = "<>";
    SQLComparisonOperator["IS"] = "IS";
    SQLComparisonOperator["IS_NOT"] = "IS NOT";
    SQLComparisonOperator["BETWEEN"] = "BETWEEN";
    SQLComparisonOperator["NOT_BETWEEN"] = "NOT BETWEEN";
    SQLComparisonOperator["BETWEEN_SYMETRIC"] = "BETWEEN SYMETRIC";
    SQLComparisonOperator["NOT_BETWEEN_SYMETRIC"] = "NOT BETWEEN SYMETRIC";
    SQLComparisonOperator["IS_DISTINCT"] = "IS DISTINCT";
    SQLComparisonOperator["IS_NOT_DISTINCT"] = "IS NOT DISTINCT";
    SQLComparisonOperator["LIKE"] = "LIKE";
    SQLComparisonOperator["ILIKE"] = "ILIKE";
    SQLComparisonOperator["CONTAINS"] = "@>";
    SQLComparisonOperator["IS_CONTAINED_BY"] = "<@";
    SQLComparisonOperator["OVERLAP"] = "&&";
    SQLComparisonOperator["CONCATENATE"] = "||";
    SQLComparisonOperator["IN"] = "IN";
})(SQLComparisonOperator || (SQLComparisonOperator = {}));
const condition = (conditionNodes = compositeNode()) => {
    return {
        or(leftOperand, operator, rightOperand) {
            conditionNodes.add(identityNode('OR'));
            return this.if(leftOperand, operator, rightOperand);
        },
        and(leftOperand, operator, rightOperand) {
            conditionNodes.add(identityNode('AND'));
            return this.if(leftOperand, operator, rightOperand);
        },
        if: fluentMethod((leftOperand, operator, rightOperand) => {
            const leftOperandNode = isBuildable(leftOperand) ?
                expressionNode(leftOperand) :
                pointerNode(leftOperand);
            let actualOperator = operator;
            let actualRightOperand = rightOperand;
            if (operator === undefined) {
                conditionNodes.add(leftOperandNode);
            }
            else {
                if (rightOperand === undefined) {
                    actualRightOperand = operator;
                    actualOperator = "=" /* EQUAL */;
                }
                const operatorNode = identityNode(actualOperator);
                const rightOperandNode = isBuildable(actualRightOperand) ?
                    expressionNode(actualRightOperand) :
                    valueNode(actualRightOperand);
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
var proxy = (mainBuilder, nodes) => (leftOperand, operator, rightOperand) => {
    const conditionNodes = compositeNode();
    const delegate = condition(conditionNodes)
        .if(leftOperand, operator, rightOperand);
    const revocable = Proxy.revocable(delegate, {
        get(target, property) {
            if (target[property] && property !== 'build') {
                return target[property];
            }
            nodes.add(conditionNodes);
            revocable.revoke();
            return typeof mainBuilder[property] === 'function' ?
                mainBuilder[property].bind(mainBuilder) :
                mainBuilder[property];
        }
    });
    return revocable.proxy;
};

const nodeSymbol = Symbol('nodes');
const clauseMixin = (...names) => {
    const api = {
        node(name, newNode) {
            const node = this[nodeSymbol][name];
            if (newNode === undefined) {
                return node;
            }
            return this[nodeSymbol][name] = newNode;
        }
    };
    for (const name of names) {
        api[name] = fluentMethod(function (...args) {
            this[nodeSymbol][name].add(...args.map(selectLikeExpression)); // Technically not all the clause would accept fromable
        });
    }
    return api;
};

function where (leftOperand, operator, rightOperand) {
    const nodes = this[nodeSymbol].where;
    let conditionNode = nodes;
    //if we have already some conditions we add the new one as a AND branch
    if (nodes.length) {
        conditionNode = compositeNode();
        nodes.add('AND', '(', conditionNode, ')');
    }
    return proxy(this, conditionNode)(leftOperand, operator, rightOperand);
}

const withAsMixin = () => ({
    with: fluentMethod(function (label, builder) {
        const n = this[nodeSymbol].with;
        const clause = compositeNode();
        clause.add(pointerNode(label), 'AS', expressionNode({ value: builder }));
        n.add(clause);
    })
});

const joinFunc = (joinType) => function (table, leftOperand, rightOperand) {
    const node = selectLikeExpression(table);
    this[nodeSymbol].join.add(identityNode(joinType), node);
    return leftOperand && rightOperand ? this.on(leftOperand, rightOperand) : this;
};
var SortDirection;
(function (SortDirection) {
    SortDirection["ASC"] = "ASC";
    SortDirection["DESC"] = "DESC";
})(SortDirection || (SortDirection = {}));
const proto = Object.assign({
    join: joinFunc('JOIN'),
    leftJoin: joinFunc('LEFT JOIN'),
    rightJoin: joinFunc('RIGHT JOIN'),
    fullJoin: joinFunc('FULL JOIN'),
    having(leftOperand, operator, rightOperand) {
        const { having } = this[nodeSymbol];
        return proxy(this, having)(leftOperand, operator, rightOperand);
    },
    on(leftOperand, operator, rightOperand) {
        const { join } = this[nodeSymbol];
        join.add('ON');
        return proxy(this, join)(leftOperand, operator, rightOperand);
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
    noop: fluentMethod(function () {
    }),
    where,
    build(params = {}, offset = 1) {
        const queryNode = compositeNode();
        const nodes = this[nodeSymbol];
        const add = eventuallyAddComposite(queryNode);
        add(nodes.with, 'with');
        add(nodes.select, 'select');
        add(nodes.from, 'from');
        add(nodes.join);
        add(nodes.where, 'where');
        add(nodes.groupBy, 'group by');
        add(nodes.having, 'having');
        add(nodes.orderBy, 'order by');
        add(nodes.limit, 'limit');
        return queryNode.build(params, offset);
    }
}, withAsMixin(), clauseMixin('from', 'select', 'groupBy'));
const select = (...args) => {
    const nodes = {
        orderBy: compositeNode({ separator: ', ' }),
        limit: compositeNode(),
        join: compositeNode(),
        from: compositeNode({ separator: ', ' }),
        select: compositeNode({ separator: ', ' }),
        where: compositeNode(),
        with: compositeNode({ separator: ', ' }),
        groupBy: compositeNode({ separator: ', ' }),
        having: compositeNode()
    };
    const instance = Object.create(Object.assign({
        clone() {
            const clone = select();
            for (const [key, value] of Object.entries(nodes)) {
                clone.node(key, value.clone());
            }
            return Object.assign(clone, this); // clone all enumerable properties too
        }
    }, proto), { [nodeSymbol]: { value: nodes } });
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
    noop: fluentMethod(function () {
    }),
    set: fluentMethod(function (prop, value) {
        const setNodes = value === undefined ?
            Object.getOwnPropertyNames(prop)
                .map(p => createSetNode(p, prop[p])) :
            [createSetNode(prop, value)];
        this[nodeSymbol].values.add(...setNodes);
    }),
    build(params = {}, offset = 1) {
        const { table, with: withC, values, from, where: where$$1, returning } = this[nodeSymbol];
        const queryNode = compositeNode();
        const add = eventuallyAddComposite(queryNode);
        add(withC, 'with');
        queryNode.add('UPDATE', table, 'SET', values);
        add(from, 'from');
        add(where$$1, 'where');
        add(returning, 'returning');
        return queryNode.build(params, offset);
    }
}, withAsMixin(), clauseMixin('returning', 'from', 'table'));
const update = (tableName) => {
    const nodes = {
        where: compositeNode(),
        table: compositeNode({ separator: ', ' }),
        returning: compositeNode({ separator: ', ' }),
        from: compositeNode({ separator: ', ' }),
        values: compositeNode({ separator: ', ' }),
        with: compositeNode({ separator: ', ' })
    };
    const instance = Object.create(Object.assign({
        clone() {
            const clone = update(tableName);
            for (const [key, value] of Object.entries(nodes)) {
                clone.node(key, value.clone());
            }
            return Object.assign(clone, this);
        }
    }, proto$1), {
        [nodeSymbol]: {
            value: nodes
        }
    });
    return instance.table(tableName);
};

const createValuesNode = (props) => item => {
    const valuesNode = compositeNode({ separator: ', ' });
    for (const prop of props) {
        valuesNode.add(item[prop] === undefined ?
            identityNode('DEFAULT') :
            valueNode(item[prop]));
    }
    return compositeNode().add('(', valuesNode, ')');
};
const proto$2 = Object.assign({
    values: fluentMethod(function (item) {
        const items = Array.isArray(item) ? item : [item];
        const mapFn = createValuesNode(this.fields);
        for (const i of items) {
            this[nodeSymbol].values.add(mapFn(i));
        }
    }),
    build(params = {}, offset = 1) {
        const queryNode = compositeNode();
        const add = eventuallyAddComposite(queryNode);
        const { into, with: withc, values, returning } = this[nodeSymbol];
        const fieldsNode = compositeNode({ separator: ', ' }).add(...this.fields.map(pointerNode));
        add(withc, 'with');
        queryNode.add('INSERT INTO', into, '(', fieldsNode, ')', 'VALUES', values);
        add(returning, 'returning');
        return queryNode.build(params, offset);
    }
}, withAsMixin(), clauseMixin('into', 'returning'));
const insert = (map, ...othersProps) => {
    const fields = typeof map === 'string' ? [map].concat(othersProps) : Object.keys(map);
    const nodes = {
        into: compositeNode({ separator: ', ' }),
        returning: compositeNode({ separator: ', ' }),
        values: compositeNode({ separator: ', ' }),
        with: compositeNode({ separator: ', ' })
    };
    const instance = Object.create(Object.assign({
        clone() {
            const clone = insert(map, ...othersProps);
            for (const [key, value] of Object.entries(nodes)) {
                clone.node(key, value.clone());
            }
            return clone;
        }
    }, proto$2), {
        [nodeSymbol]: {
            value: nodes
        },
        fields: { value: fields }
    });
    if (typeof map !== 'string') {
        instance.values(map);
    }
    return instance;
};

const proto$3 = Object.assign({
    where,
    noop: fluentMethod(function () {
    }),
    from(...args) {
        return this.table(...args);
    },
    build(params = {}, offset = 1) {
        const { table, with: withc, using, where: where$$1, returning } = this[nodeSymbol];
        const queryNode = compositeNode();
        const add = eventuallyAddComposite(queryNode);
        add(withc, 'with');
        queryNode.add('DELETE FROM', table);
        add(using, 'using');
        add(where$$1, 'where');
        add(returning, 'returning');
        return queryNode.build(params, offset);
    }
}, withAsMixin(), clauseMixin('table', 'using', 'returning'));
const del = (tableName) => {
    const nodes = {
        returning: compositeNode({ separator: ', ' }),
        using: compositeNode({ separator: ', ' }),
        table: compositeNode(),
        where: compositeNode(),
        with: compositeNode({ separator: ', ' })
    };
    const instance = Object.create(Object.assign({
        clone() {
            const clone = del(tableName);
            for (const [key, value] of Object.entries(nodes)) {
                clone.node(key, value.clone());
            }
            return clone;
        }
    }, proto$3), {
        [nodeSymbol]: {
            value: nodes
        }
    });
    if (tableName) {
        instance.from(tableName);
    }
    return instance;
};

const aggregateFunc = (fn) => (field) => functionNode(fn)
    .add(field);
const count = aggregateFunc('count');
const avg = aggregateFunc('avg');
const sum = aggregateFunc('sum');
const toJson = aggregateFunc('to_json');
const toJsonb = aggregateFunc('to_jsonb');
const jsonAgg = aggregateFunc('json_agg');

const coalesce = (values, as) => {
    return functionNode('COALESCE', as)
        .add(...values);
};

export { del as delete, SQLComparisonOperator, condition, SortDirection, select, update, insert, count, avg, sum, toJson, toJsonb, jsonAgg, identityNode, valueNode, pointerNode, expressionNode, compositeNode, functionNode, coalesce };
//# sourceMappingURL=ship-hold-querybuilder.es.js.map
