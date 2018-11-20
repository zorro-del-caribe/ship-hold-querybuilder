import {functionNode, pointerNode} from './nodes';

export const coalesce = (values: any[],as?: string) => {
    return functionNode('COALESCE', as)
        .add(...values);
};
