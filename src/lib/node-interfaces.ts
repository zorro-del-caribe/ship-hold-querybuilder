import {SelectLikeExpression} from './util';

export interface Cloneable {
    clone(): this;
}

export interface SQLQuery {
    text: string;
    values: any[];
}

export interface Buildable {
    build(params: object, offset: number): SQLQuery;
}

export interface SQLNodeValue<T> {
    value: T;
    as?: string;
}

export interface SQLNode<T> extends Buildable, Cloneable {
    node: SQLNodeValue<T>;
    map: (fn: Function) => SQLNode<T>;
}

export type NodeParam<T> = string | SQLNodeValue<T>;

export interface CompositeNodeFactoryInput {
    separator: string;
}

export type CompositeNodeMember = SQLNode<any> | CompositeNode | FunctionNode | string;

export interface CompositeNode extends Buildable, Cloneable, Iterable<CompositeNodeMember> {
    readonly nodes: CompositeNodeMember[];

    add(...subNodes: CompositeNodeMember[]): CompositeNode;

    readonly length: number;

    readonly separator: string;
}

export interface FunctionNode extends Buildable, Cloneable {
    add(...args: SelectLikeExpression[]): FunctionNode;

    readonly alias?: string;
    readonly args: CompositeNodeMember[];
    readonly functionName: string;
}

export interface Builder extends Buildable {
    node(clause: string, newNode ?: CompositeNode): CompositeNode;
}
