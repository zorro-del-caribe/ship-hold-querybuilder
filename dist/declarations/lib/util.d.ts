import { Buildable, CompositeNode, SQLNodeValue } from './nodes';
export declare const fluentMethod: (fn: Function) => (...args: any[]) => any;
export declare const isBuildable: (val: any) => val is Buildable;
export declare const isSQLNodeValue: <T>(val: any) => val is SQLNodeValue<T>;
export declare const isSubQuery: (node: any) => boolean;
export declare const identity: (val: any) => any;
export declare const eventuallyAddComposite: (target: CompositeNode) => (composite: CompositeNode, keyword?: string) => void;
