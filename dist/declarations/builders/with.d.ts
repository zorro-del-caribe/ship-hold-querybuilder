import { Buildable } from '..';
export interface WithClause {
    with(label: string, builder: Buildable): WithClause;
}
export declare const withAsMixin: () => WithClause;
