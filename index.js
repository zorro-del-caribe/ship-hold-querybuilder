const condition = require('./builders/conditions');
const select = require('./builders/select');

module.exports = function () {
  return {condition, select};
};