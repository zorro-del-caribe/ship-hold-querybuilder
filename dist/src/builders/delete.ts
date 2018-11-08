import {Buildable, compositeNode, NodeParam} from '../lib/nodes';
import {clauseMixin, nodeSymbol, TableClause, UsingClause} from './clause';
import where from './where';
import {ConditionsBuilder, SQLComparisonOperator} from './conditions';

type WithTableUsingClause = TableClause & UsingClause;

export interface DeleteBuilder extends WithTableUsingClause, Buildable {
    where(leftOperand: NodeParam<any>, operator?: SQLComparisonOperator, rightOperand ?: NodeParam<any>): ConditionsBuilder<DeleteBuilder> & DeleteBuilder;

    from(...args): DeleteBuilder;
}

const proto = Object.assign({
    where,
    from(...args) {
        return this.table(...args);
    },
    build(params = {}) {
        const {table, using, where} = this[nodeSymbol];
        const queryNode = compositeNode()
            .add('DELETE FROM', table);

        if (using.length > 0) {
            queryNode.add('USING', using);
        }

        if (where.length > 0) {
            queryNode.add('WHERE', where);
        }

        return queryNode.build(params);
    }
}, clauseMixin<WithTableUsingClause>('table', 'using'));

export const del = (tableName: string): DeleteBuilder => {
    const instance = Object.create(proto, {
        [nodeSymbol]: {
            value: {
                using: compositeNode(),
                table: compositeNode(),
                where: compositeNode()
            }
        }
    });

    if (tableName) {
        instance.from(tableName);
    }

    return instance;
};
