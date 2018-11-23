import {compositeNode, pointerNode, valueNode} from '../lib/nodes';
import {eventuallyAddComposite, fluentMethod} from '../lib/util';
import where from './where';
import {clauseMixin, IntoClause, nodeSymbol, ReturningClause} from './clause';
import {ConditionsBuilder, SQLComparisonOperator} from './conditions';
import {withAsMixin} from './with';
import {Builder, NodeParam} from '../lib/node-interfaces';

type WithReturningFromTable = IntoClause<UpdateBuilder> & ReturningClause<UpdateBuilder>;

export interface UpdateBuilder extends WithReturningFromTable, Builder {
    where(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand ?: NodeParam<any>): ConditionsBuilder<UpdateBuilder> & UpdateBuilder;

    set<T>(prop: string, value: T): UpdateBuilder;

    noop: () => UpdateBuilder;
}

const createSetNode = (prop, value) => compositeNode()
    .add(pointerNode(prop), '=', valueNode(value));

const proto = Object.assign({
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
        const {table, with: withC, values, from, where, returning} = this[nodeSymbol];

        const queryNode = compositeNode();
        const add = eventuallyAddComposite(queryNode);
        add(withC, 'with');
        queryNode.add('UPDATE', table, 'SET', values);
        add(from, 'from');
        add(where, 'where');
        add(returning, 'returning');
        return queryNode.build(params, offset);
    }
}, withAsMixin<UpdateBuilder>(), clauseMixin<UpdateBuilder>('returning', 'from', 'table'));

export const update = (tableName: string): UpdateBuilder => {
    const nodes = {
        where: compositeNode(),
        table: compositeNode({separator: ', '}),
        returning: compositeNode({separator: ', '}),
        from: compositeNode({separator: ', '}),
        values: compositeNode({separator: ', '}),
        with: compositeNode({separator: ', '})
    };

    const instance = Object.create(Object.assign({
        clone() {
            const clone = update(tableName);
            for (const [key, value] of Object.entries(nodes)) {
                clone.node(key, value.clone());
            }
            return Object.assign(clone, this);
        }
    }, proto), {
        [nodeSymbol]: {
            value: nodes
        }
    });
    return instance.table(tableName);
};
