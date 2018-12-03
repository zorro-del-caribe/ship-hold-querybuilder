import { compositeNode, valueNode, identityNode, pointerNode, } from '../lib/nodes';
import proxy from '../lib/proxy-condition';
import { fluentMethod, eventuallyAddComposite, selectLikeExpression } from '../lib/util';
import { clauseMixin, nodeSymbol } from './clause';
import where from './where';
import { withAsMixin } from './with';
const joinFunc = (joinType) => function (table, leftOperand, rightOperand) {
    const node = selectLikeExpression(table);
    this[nodeSymbol].join.add(identityNode(joinType), node);
    return leftOperand && rightOperand ? this.on(leftOperand, rightOperand) : this;
};
export var SortDirection;
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
export const select = (...args) => {
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
