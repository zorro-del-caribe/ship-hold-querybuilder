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
    fn?: string;
}
export interface SQLNode<T> extends Buildable {
    node: SQLNodeValue<T>;
}
export declare type NodeParam<T> = string | SQLNodeValue<T>;
export declare const identityNode: <T>(params: NodeParam<T>) => SQLNode<string | T>;
declare type CompositeNodeMember = SQLNode<any> | CompositeNode | string;
export interface CompositeNode extends Buildable, Iterable<CompositeNodeMember> {
    add(...subNodes: (CompositeNodeMember)[]): CompositeNode;
    readonly length: number;
    readonly separator: string;
}
export declare const valueNode: <T>(params: NodeParam<T>) => SQLNode<T>;
export declare const pointerNode: (params: NodeParam<string>) => SQLNode<string>;
export declare const expressionNode: (params: NodeParam<Buildable>) => SQLNode<Buildable>;
export interface CompositeNodeFactoryInput {
    separator: string;
    type?: string;
}
export declare const compositeNode: ({ separator }?: CompositeNodeFactoryInput) => CompositeNode;
export {};
