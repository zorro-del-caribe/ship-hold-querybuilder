const stampit = require('stampit');
const nodes = require('../lib/nodes');
const clauses = require('./clause');
const where = require('./where');

const updateStamp = stampit()
  .init(function () {
    this.valueNodes = nodes.compositeNode({separator: ', '});
  })
  .methods({
    set(prop, value){

      function createSetNode (prop, value) {
        const propNode = nodes.pointerNode(prop);
        const valueNode = nodes.castNode(value);
        return nodes.compositeNode({separator: ''})
          .add(propNode, '=', valueNode);
      }

      if (value === undefined) {
        const setNodes = Object.getOwnPropertyNames(prop).map(p=>createSetNode(p, prop[p]));
        this.valueNodes.add(...setNodes);
      } else {
        const setNode = createSetNode(prop, value);
        this.valueNodes.add(setNode);
      }
      return this;
    },
    build(){
      const queryNode = nodes.compositeNode()
        .add('UPDATE', this.tableNodes, 'SET', this.valueNodes);

      if (this.whereNodes.length > 0) {
        queryNode.add('WHERE', this.whereNodes);
      }

      return queryNode.build();
    }
  })
  .compose(clauses('table'), where);

module.exports = function (tableName) {
  return updateStamp()
    .table(tableName);
};