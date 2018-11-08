import { Buildable } from '../lib/nodes';
export interface SelectBuilder extends Buildable {
    join(): any;
    leftJoin(): any;
    rightJoin(): any;
    fullJoin(): any;
    on(): any;
    orderBy(): any;
    limit(): any;
    noop(): any;
    where(): any;
    from(): any;
    select(): any;
}
declare const _default: (...args: any[]) => any;
export default _default;
