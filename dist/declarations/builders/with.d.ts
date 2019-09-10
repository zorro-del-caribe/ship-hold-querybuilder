import { Buildable } from '../lib/node-interfaces';
export interface WithClause {
    with(label: string, builder: Buildable): this;
}
export declare const withAsMixin: () => WithClause;
