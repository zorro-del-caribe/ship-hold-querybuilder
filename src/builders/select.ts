import {
    compositeNode,
    valueNode,
    identityNode,
    pointerNode,
    expressionNode,
    SQLNode,
    Buildable,
    NodeParam
} from '../lib/nodes';
import proxy from '../lib/proxy-condition';
import {fluentMethod, identity, isSubQuery} from '../lib/util';
import {clauseMixin, nodeSymbol} from './clause';
import where from './where';
import {SQLComparisonOperator} from './conditions';

const joinFunc = (joinType: string) => function (table: string, leftOperand: NodeParam<any>, rightOperand: NodeParam<any>) {
    const node: SQLNode<any> = isSubQuery(table) ? expressionNode(table) : pointerNode(table); // todo
    this[nodeSymbol].join.add(identityNode(joinType), node);
    return leftOperand && rightOperand ? this.on(leftOperand, rightOperand) : this;
};

export interface SelectBuilder extends Buildable {
    join();

    leftJoin();

    rightJoin();

    fullJoin();

    on();

    orderBy();

    limit();

    noop();

    where();

    from();

    select();
}

const proto = Object.assign({
    join: joinFunc('JOIN'),
    leftJoin: joinFunc('LEFT JOIN'),
    rightJoin: joinFunc('RIGHT JOIN'),
    fullJoin: joinFunc('FULL JOIN'),
    on(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand ?: NodeParam<any>) {
        // Todo throw exception if last join nodes is not a identity node
        const {join} = this[nodeSymbol];
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
    noop: fluentMethod(identity),
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

export default (...args) => {
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
