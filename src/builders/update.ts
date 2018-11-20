import {compositeNode, pointerNode, valueNode} from '../lib/nodes';
import {eventuallyAddComposite, fluentMethod} from '../lib/util';
import where from './where';
import {clauseMixin, IntoClause, nodeSymbol, ReturningClause} from './clause';
import {ConditionsBuilder, SQLComparisonOperator} from './conditions';
import {withAsMixin} from './with';
import {Buildable, NodeParam} from '../lib/node-interfaces';

type WithReturningFromTable = IntoClause<UpdateBuilder> & ReturningClause<UpdateBuilder>;

export interface UpdateBuilder extends WithReturningFromTable, Buildable {
    where(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand ?: NodeParam<any>): ConditionsBuilder<UpdateBuilder> & UpdateBuilder;

    set<T>(prop: string, value: T): UpdateBuilder;
}

const createSetNode = (prop, value) => compositeNode()
    .add(pointerNode(prop), '=', valueNode(value));

const proto = Object.assign({
    where,
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
    const instance = Object.create(proto, {
        [nodeSymbol]: {
            value: {
                where: compositeNode(),
                table: compositeNode({separator: ', '}),
                returning: compositeNode({separator: ', '}),
                from: compositeNode({separator: ', '}),
                values: compositeNode({separator: ', '}),
                with: compositeNode({separator: ', '})
            }
        }
    });
    return instance.table(tableName);
};
