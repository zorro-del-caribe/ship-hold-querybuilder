import { Buildable } from '../lib/node-interfaces';
export interface WithClause<T> {
    with(label: string, builder: Buildable): T;
}
export declare const withAsMixin: <T>() => WithClause<T>;
