const stampit = require('stampit');
const nodes = require('../lib/nodes');
const clauses = require('./clause');
const where = require('./where');

//delete query builder
const deleteStamp = stampit()
  .methods({
    from(){
      return this.table(...arguments)
    },
    build(params={}){
      const queryNode = nodes.compositeNode()
        .add('DELETE FROM', this.tableNodes);

      if (this.whereNodes.length > 0) {
        queryNode.add('WHERE', this.whereNodes);
      }

      return queryNode.build(params);
    }
  })
  .compose(clauses('table'), where);

module.exports = function (tableName) {
  const instance = deleteStamp();
  if (tableName) {
    instance.from(tableName);
  }
  return instance;
};