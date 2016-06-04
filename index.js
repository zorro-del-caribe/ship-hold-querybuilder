const condition = require('./builders/conditions');
const select = require('./builders/select');
const update = require('./builders/update');
const insert = require('./builders/insert');
const del = require('./builders/delete');
const nodes = require('./lib/nodes');

module.exports = function () {
  return {condition, select, update, insert, delete: del, nodes};
};