import {compositeNode} from '../lib/nodes';
import {clauseMixin, nodeSymbol, ReturningClause, TableClause, UsingClause} from './clause';
import where from './where';
import {ConditionsBuilder, SQLComparisonOperator} from './conditions';
import {eventuallyAddComposite, fluentMethod} from '../lib/util';
import {withAsMixin} from './with';
import {NodeParam, Builder, Cloneable} from '../lib/node-interfaces';

type WithTableUsingReturningClause =
    TableClause
    & UsingClause
    & ReturningClause;

export interface DeleteBuilder extends WithTableUsingReturningClause, Builder, Cloneable {
    where(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand ?: NodeParam<any>): ConditionsBuilder<DeleteBuilder> & DeleteBuilder;

    from(...args): DeleteBuilder;

    noop(): DeleteBuilder;
}

const proto = Object.assign({
    where,
    noop: fluentMethod(function () {
    }),
    from(...args) {
        return this.table(...args);
    },
    build(params = {}, offset = 1) {
        const {table, with: withc, using, where, returning} = this[nodeSymbol];
        const queryNode = compositeNode();
        const add = eventuallyAddComposite(queryNode);
        add(withc, 'with');
        queryNode.add('DELETE FROM', table);
        add(using, 'using');
        add(where, 'where');
        add(returning, 'returning');
        return queryNode.build(params, offset);
    }
}, withAsMixin(), clauseMixin<DeleteBuilder>('table', 'using', 'returning'));

export const del = (tableName: string): DeleteBuilder => {
    const nodes = {
        returning: compositeNode({separator: ', '}),
        using: compositeNode({separator: ', '}),
        table: compositeNode(),
        where: compositeNode(),
        with: compositeNode({separator: ', '})
    };
    const instance = Object.create(Object.assign({
        clone() {
            const clone = del(tableName);
            for (const [key, value] of Object.entries(nodes)) {
                clone.node(key, value.clone());
            }
            return clone;
        }
    }, proto), {
        [nodeSymbol]: {
            value: nodes
        }
    });

    if (tableName) {
        instance.from(tableName);
    }

    return instance;
};
