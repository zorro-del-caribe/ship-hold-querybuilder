import {
    compositeNode,
    valueNode,
    identityNode,
    pointerNode, functionNode,
} from '../lib/nodes';
import proxy from '../lib/proxy-condition';
import {
    fluentMethod,
    eventuallyAddComposite,
    SelectLikeExpression,
    selectLikeExpression
} from '../lib/util';
import {clauseMixin, FromClause, GroupByClause, nodeSymbol} from './clause';
import where from './where';
import {ConditionFunction, SQLComparisonOperator} from './conditions';
import {withAsMixin, WithClause} from './with';
import {Builder, Cloneable, NodeParam} from '../lib/node-interfaces';


const joinFunc = (joinType: string) => function (this: SelectBuilder, table: SelectLikeExpression, leftOperand: any, rightOperand: any) {
    const node = selectLikeExpression(table);
    this[nodeSymbol].join.add(identityNode(joinType), node);
    return leftOperand && rightOperand ? this.on(leftOperand, rightOperand) : this;
};

export const enum SortDirection {
    ASC = 'ASC',
    DESC = 'DESC'
}

interface FromWithClauseGroupBy<T> extends FromClause<T>, WithClause<T>, GroupByClause<T> {

}

export interface SelectBuilder extends Builder, FromWithClauseGroupBy<SelectBuilder>, WithClause<SelectBuilder>, Cloneable<SelectBuilder> {
    join(table: SelectLikeExpression): SelectBuilder;

    leftJoin(table: SelectLikeExpression): SelectBuilder;

    rightJoin(table: SelectLikeExpression): SelectBuilder;

    fullJoin(table: SelectLikeExpression): SelectBuilder;

    on: ConditionFunction<SelectBuilder>;

    orderBy(column: string, direction?: SortDirection): SelectBuilder;

    limit(limit: number, offset?: number): SelectBuilder;

    noop(): SelectBuilder;

    where: ConditionFunction<SelectBuilder>;

    select(...params: NodeParam<any>[]): SelectBuilder;
}

const proto = Object.assign({
    join: joinFunc('JOIN'),
    leftJoin: joinFunc('LEFT JOIN'),
    rightJoin: joinFunc('RIGHT JOIN'),
    fullJoin: joinFunc('FULL JOIN'),
    having(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand ?: NodeParam<any>) {
        const {having} = this[nodeSymbol];
        return proxy(this, having)(leftOperand, operator, rightOperand);
    },
    on(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand ?: NodeParam<any>) {
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
}, withAsMixin<SelectBuilder>(), clauseMixin<SelectBuilder>('from', 'select', 'groupBy'));

export const select = (...args: SelectLikeExpression[]): SelectBuilder => {
    const nodes = {
        orderBy: compositeNode({separator: ', '}),
        limit: compositeNode(),
        join: compositeNode(),
        from: compositeNode({separator: ', '}),
        select: compositeNode({separator: ', '}),
        where: compositeNode(),
        with: compositeNode({separator: ', '}),
        groupBy: compositeNode({separator: ', '}),
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
    }, proto), {[nodeSymbol]: {value: nodes}});

    if (args.length === 0) {
        args.push('*');
    }

    return instance
        .select(...args);
};
