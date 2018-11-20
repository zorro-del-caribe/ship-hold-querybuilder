import { functionNode } from './nodes';
export const coalesce = (values, as) => {
    return functionNode('COALESCE', as)
        .add(...values);
};
