import { Buildable, NodeParam, SQLNodeValue, CompositeNode, FunctionNode } from './node-interfaces';
export declare const fluentMethod: (fn: Function) => (...args: any[]) => any;
export declare const isBuildable: (val: any) => val is Buildable;
export declare const isSQLNodeValue: <T>(val: any) => val is SQLNodeValue<T>;
export declare const isFunctionNode: (val: any) => val is FunctionNode;
export declare const identity: (val: any) => any;
export declare type SelectLikeExpression = NodeParam<string | Buildable> | Buildable;
export declare const selectLikeExpression: (val: SelectLikeExpression) => FunctionNode | import("./node-interfaces").SQLNode<Buildable> | import("./node-interfaces").SQLNode<string>;
export declare const eventuallyAddComposite: (target: CompositeNode) => (composite: CompositeNode, keyword?: string) => void;
