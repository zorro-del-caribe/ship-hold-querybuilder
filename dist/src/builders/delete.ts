import {compositeNode} from '../lib/nodes';
import {clauseMixin, nodeSymbol, TableClause, UsingClause} from './clause';
import where from './where';
import {ConditionsBuilder, SQLComparisonOperator} from './conditions';
import {eventuallyAddComposite} from '../lib/util';
import {withAsMixin} from './with';
import {NodeParam, Buildable} from '../lib/node-interfaces';

type WithTableUsingClause = TableClause<DeleteBuilder> & UsingClause<DeleteBuilder>;

export interface DeleteBuilder extends WithTableUsingClause, Buildable {
    where(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand ?: NodeParam<any>): ConditionsBuilder<DeleteBuilder> & DeleteBuilder;

    from(...args): DeleteBuilder;
}

const proto = Object.assign({
    where,
    from(...args) {
        return this.table(...args);
    },
    build(params = {}, offset = 1) {
        const {table, with: withc, using, where} = this[nodeSymbol];
        const queryNode = compositeNode();
        const add = eventuallyAddComposite(queryNode);
        add(withc, 'with');
        queryNode.add('DELETE FROM', table);
        add(using, 'using');
        add(where, 'where');
        return queryNode.build(params, offset);
    }
}, withAsMixin<DeleteBuilder>(), clauseMixin<DeleteBuilder>('table', 'using'));

export const del = (tableName: string): DeleteBuilder => {
    const instance = Object.create(proto, {
        [nodeSymbol]: {
            value: {
                using: compositeNode(),
                table: compositeNode(),
                where: compositeNode(),
                with: compositeNode({separator: ', '})
            }
        }
    });

    if (tableName) {
        instance.from(tableName);
    }

    return instance;
};
