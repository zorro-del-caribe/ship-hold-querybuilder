import {Buildable, compositeNode} from '../lib/nodes';
import {clauseMixin, nodeSymbol, TableClause, UsingClause} from './clause';
import where from './where';
import {ConditionsBuilder} from './conditions';

type WithTableUsingClause = TableClause & UsingClause;

interface DeleteBuilder extends WithTableUsingClause, Buildable {
    where: ConditionsBuilder;

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

export default (tableName: string): DeleteBuilder => {
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
