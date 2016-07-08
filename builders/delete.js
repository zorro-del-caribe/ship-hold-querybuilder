const stampit = require('stampit');
const nodes = require('../lib/nodes');
const clauses = require('./clause');
const where = require('./where');

const deleteStamp = stampit()
  .methods({
    from(){
      return this.table(...arguments);
    },
    build(params = {}){
      const queryNode = nodes.compositeNode()
        .add('DELETE FROM', this.tableNodes);

      if (this.usingNodes.length) {
        queryNode.add('USING', this.usingNodes);
      }

      if (this.whereNodes.length) {
        queryNode.add('WHERE', this.whereNodes);
      }

      return queryNode.build(params);
    }
  })
  .compose(clauses('table'), where, clauses('using'));

module.exports = function (tableName) {
  const instance = deleteStamp();
  if (tableName) {
    instance.from(tableName);
  }
  return instance;
};