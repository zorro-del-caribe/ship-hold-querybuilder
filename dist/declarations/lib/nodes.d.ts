import { SQLNode, Buildable, NodeParam, SQLNodeValue, CompositeNodeFactoryInput, FunctionNode, CompositeNode } from './node-interfaces';
export declare const identityNode: <T>(params: NodeParam<T>) => SQLNode<string | T>;
export declare const valueNode: <T>(params: NodeParam<T>) => SQLNode<T>;
export declare const pointerNode: (params: NodeParam<string>) => SQLNode<string>;
export declare const expressionNode: (params: Buildable | SQLNodeValue<Buildable>) => SQLNode<Buildable>;
export declare const compositeNode: ({ separator }?: CompositeNodeFactoryInput) => CompositeNode;
export declare const functionNode: (fnName: string, alias?: string) => FunctionNode;
