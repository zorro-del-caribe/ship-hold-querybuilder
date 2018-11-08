import { Buildable } from '../lib/nodes';
import { FieldClause, IntoClause, ReturningClause } from './clause';
declare type WithIntoFieldReturningClause = IntoClause & FieldClause & ReturningClause;
interface InsertBuilder extends WithIntoFieldReturningClause, Buildable {
    value: <T>(prop: string, value: T) => InsertBuilder;
}
declare const _default: (map?: {}) => InsertBuilder;
export default _default;
