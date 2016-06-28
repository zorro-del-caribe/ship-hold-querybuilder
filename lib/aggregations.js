function aggregateFunc (fn) {
  return function (field, label = fn) {
    return {
      value: field,
      as: label,
      fn: fn.toUpperCase()
    }
  }
}
module.exports = {
  count: aggregateFunc('count'),
  avg: aggregateFunc('avg'),
  sum: aggregateFunc('sum')
};