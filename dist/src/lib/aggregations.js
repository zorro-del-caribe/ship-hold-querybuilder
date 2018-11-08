const aggregateFunc = (fn) => (field, label = fn) => ({ value: field, as: label, fn: fn.toUpperCase() });
export const count = aggregateFunc('count');
export const avg = aggregateFunc('avg');
export const sum = aggregateFunc('sum');
