import { Buildable } from '../lib/nodes';
import { TableClause, UsingClause } from './clause';
import { ConditionsBuilder } from './conditions';
declare type WithTableUsingClause = TableClause & UsingClause;
interface DeleteBuilder extends WithTableUsingClause, Buildable {
    where: ConditionsBuilder;
    from(...args: any[]): DeleteBuilder;
}
declare const _default: (tableName: string) => DeleteBuilder;
export default _default;
