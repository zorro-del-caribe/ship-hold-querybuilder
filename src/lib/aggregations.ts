import {functionNode} from './nodes';

const aggregateFunc = (fn: string) => (field) => functionNode(fn)
    .add(field);
export const count = aggregateFunc('count');
export const avg = aggregateFunc('avg');
export const sum = aggregateFunc('sum');
export const toJson = aggregateFunc('to_json');
export const toJsonb = aggregateFunc('to_jsonb');
export const jsonAgg = aggregateFunc('json_agg');
