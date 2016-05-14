const comparisons = Object.create({}, {
  LESS: {value: '<'},
  GREATER: {value: '>'},
  LESS_OR_EQUAL: {value: '<='},
  GREATER_OR_EQUAL: {value: '>='},
  EQUAL: {value: '='},
  NOT_EQUAL: {value: '!='}
});
Object.freeze(comparisons);
const logical = Object.create({}, {
  AND: {value: 'AND'},
  OR: {value: 'OR'},
  NOT: {value: 'NOT'}
});
Object.freeze(logical);
module.exports = comparisons;