import { Buildable } from '../lib/nodes';
import { FieldClause, IntoClause, ReturningClause } from './clause';
import { ConditionsBuilder } from './conditions';
declare type WithReturningFromTable = IntoClause & FieldClause & ReturningClause;
interface UpdateBuilder extends WithReturningFromTable, Buildable {
    where: ConditionsBuilder;
    set<T>(prop: string, value: T): UpdateBuilder;
}
declare const _default: (tableName: string) => UpdateBuilder;
export default _default;
