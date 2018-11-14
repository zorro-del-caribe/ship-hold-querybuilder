import { compositeNode, expressionNode, pointerNode } from '..';

const fluentMethod = (fn) => function (...args) {
    fn.bind(this)(...args);
    return this;
};
const isBuildable = (val) => val.build && typeof val.build === 'function';
const isSQLNodeValue = (val) => val && typeof val.value !== 'undefined';
const isSubQuery = node => node.value && isBuildable(node.value);
const identity = val => val;
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
const pointerNodeProto = {
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
        const value = node.fn ? `${node.fn}(${val})` : val;
        const text = node.as ? `${value} AS ${wrap(node.as)}` : value;
        return { text, values: [] };
    }
};
const expressionNodeProto = {
    build(params, offset) {
        const { node } = this;
        const { text, values } = node.value.build(params, offset);
        const fullText = node.as ? [`(${text})`, 'AS', wrap(node.as)].join(' ') : `(${text})`;
        return { text: fullText, values };
    }
};
const identityNodeProto = {
    build: buildStringMethodFactory(identity)
};
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
            if (n[Symbol.iterator] === undefined) {
                yield n.node;
            }
            else {
                yield* n;
            }
        }
    },
    add(...args) {
        const nodeArgs = args.map(n => isBuildable(n) ? n : identityNode(n));
        this.nodes.push(...nodeArgs);
        return this;
    },
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
    }
};
const valueNodeProto = {
    build: buildStringMethodFactory(parseValue)
};
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
const pointerNode$1 = (params) => {
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
const expressionNode$1 = (params) => {
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
const compositeNode$1 = ({ separator = ' ' } = {
    separator: ' ',
    type: 'unknown composite'
}) => Object.create(compositeNodeProto, {
    nodes: { value: [] },
    length: {
        get() {
            return this.nodes.length;
        }
    },
    separator: { value: separator }
});

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
})(SQLComparisonOperator || (SQLComparisonOperator = {}));
const condition = (conditionNodes = compositeNode$1()) => {
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
                expressionNode$1(leftOperand) :
                pointerNode$1(leftOperand);
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
                    expressionNode$1(actualRightOperand) :
                    valueNode(actualRightOperand);
                const whereNode = compositeNode$1()
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
    const conditionNodes = compositeNode$1();
    const delegate = condition(conditionNodes)
        .if(leftOperand, operator, rightOperand);
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
            // todo we might make a difference here between clauses which accept subqueries and other subqueries with mandatory aliases ex SELECT ... VS FROM ...
            this[nodeSymbol][name].add(...args.map(n => isSubQuery(n) ? expressionNode$1(n) : pointerNode$1(n)));
        });
    }
    return api;
};

function where (leftOperand, operator, rightOperand) {
    return proxy(this, this[nodeSymbol].where)(leftOperand, operator, rightOperand);
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
    const node = isSubQuery(table) ? expressionNode$1(table) : pointerNode$1(table); // todo
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
    on(leftOperand, operator, rightOperand) {
        // Todo throw exception if last join nodes is not a identity node
        const { join } = this[nodeSymbol];
        join.add('ON');
        return proxy(this, join)(leftOperand, operator, rightOperand);
    },
    orderBy: fluentMethod(function (column, direction) {
        const newOrderByNode = compositeNode$1();
        newOrderByNode.add(pointerNode$1(column));
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
    noop: fluentMethod(identity),
    where,
    build(params = {}, offset = 1) {
        const queryNode = compositeNode$1();
        const nodes = this[nodeSymbol];
        const add = eventuallyAddComposite(queryNode);
        add(nodes.with, 'with');
        add(nodes.select, 'select');
        add(nodes.from, 'from');
        add(nodes.join);
        add(nodes.where, 'where');
        add(nodes.orderBy, 'order by');
        add(nodes.limit, 'limit');
        return queryNode.build(params, offset);
    }
}, withAsMixin(), clauseMixin('from', 'select'));
const select = (...args) => {
    const nodes = {
        orderBy: compositeNode$1({ separator: ', ' }),
        limit: compositeNode$1(),
        join: compositeNode$1(),
        from: compositeNode$1({ separator: ', ' }),
        select: compositeNode$1({ separator: ', ' }),
        where: compositeNode$1(),
        with: compositeNode$1({ separator: ', ' })
    };
    const instance = Object.create(proto, { [nodeSymbol]: { value: nodes } });
    if (args.length === 0) {
        args.push('*');
    }
    return instance
        .select(...args);
};

const createSetNode = (prop, value) => compositeNode$1()
    .add(pointerNode$1(prop), '=', valueNode(value));
const proto$1 = Object.assign({
    where,
    set: fluentMethod(function (prop, value) {
        const setNodes = value === undefined ?
            Object.getOwnPropertyNames(prop)
                .map(p => createSetNode(p, prop[p])) :
            [createSetNode(prop, value)];
        this[nodeSymbol].values.add(...setNodes);
    }),
    build(params = {}, offset = 1) {
        const { table, with: withC, values, from, where: where$$1, returning } = this[nodeSymbol];
        const queryNode = compositeNode$1();
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
    const instance = Object.create(proto$1, {
        [nodeSymbol]: {
            value: {
                where: compositeNode$1(),
                table: compositeNode$1({ separator: ', ' }),
                returning: compositeNode$1({ separator: ', ' }),
                from: compositeNode$1({ separator: ', ' }),
                values: compositeNode$1({ separator: ', ' }),
                with: compositeNode$1({ separator: ', ' })
            }
        }
    });
    return instance.table(tableName);
};

const proto$2 = Object.assign({
    value: fluentMethod(function (prop, value) {
        this.field(prop);
        this[nodeSymbol].values.add(value === undefined ? identityNode('DEFAULT') : valueNode(value));
    }),
    build(params = {}, offset = 1) {
        const queryNode = compositeNode$1();
        const add = eventuallyAddComposite(queryNode);
        const { into, with: withc, field, values, returning } = this[nodeSymbol];
        add(withc, 'with');
        queryNode.add('INSERT INTO', into, '(', field, ')', 'VALUES', '(', values, ')');
        add(returning, 'returning');
        return queryNode.build(params, offset);
    }
}, withAsMixin(), clauseMixin('into', 'field', 'returning'));
const insert = (map = {}) => {
    const instance = Object.create(proto$2, {
        [nodeSymbol]: {
            value: {
                into: compositeNode$1({ separator: ', ' }),
                field: compositeNode$1({ separator: ', ' }),
                returning: compositeNode$1({ separator: ', ' }),
                values: compositeNode$1({ separator: ', ' }),
                with: compositeNode$1({ separator: ', ' })
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
    build(params = {}, offset = 1) {
        const { table, with: withc, using, where: where$$1 } = this[nodeSymbol];
        const queryNode = compositeNode$1();
        const add = eventuallyAddComposite(queryNode);
        add(withc, 'with');
        queryNode.add('DELETE FROM', table);
        add(using, 'using');
        add(where$$1, 'where');
        return queryNode.build(params, offset);
    }
}, withAsMixin(), clauseMixin('table', 'using'));
const del = (tableName) => {
    const instance = Object.create(proto$3, {
        [nodeSymbol]: {
            value: {
                using: compositeNode$1(),
                table: compositeNode$1(),
                where: compositeNode$1(),
                with: compositeNode$1({ separator: ', ' })
            }
        }
    });
    if (tableName) {
        instance.from(tableName);
    }
    return instance;
};

const aggregateFunc = (fn) => (field, label = fn) => ({ value: field, as: label, fn });
const count = aggregateFunc('count');
const avg = aggregateFunc('avg');
const sum = aggregateFunc('sum');
const toJson = aggregateFunc('to_json');
const jsonAgg = aggregateFunc('json_agg');

export { del as delete, SQLComparisonOperator, condition, SortDirection, select, update, insert, count, avg, sum, toJson, jsonAgg, identityNode, valueNode, pointerNode$1 as pointerNode, expressionNode$1 as expressionNode, compositeNode$1 as compositeNode };
