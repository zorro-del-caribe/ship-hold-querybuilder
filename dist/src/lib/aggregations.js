const aggregateFunc = (fn) => (field, label = fn) => ({ value: field, as: label, fn });
export const count = aggregateFunc('count');
export const avg = aggregateFunc('avg');
export const sum = aggregateFunc('sum');
export const toJson = aggregateFunc('to_json');
export const jsonAgg = aggregateFunc('json_agg');
