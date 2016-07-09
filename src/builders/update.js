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
        const valueNode = nodes.valueNode(value);
        return nodes.compositeNode({separator: ' '})
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
    build(params = {}){
      const queryNode = nodes.compositeNode()
        .add('UPDATE', this.tableNodes, 'SET', this.valueNodes);

      if (this.fromNodes.length) {
        queryNode.add('FROM', this.fromNodes);
      }

      if (this.whereNodes.length) {
        queryNode.add('WHERE', this.whereNodes);
      }
      if (this.returningNodes.length) {
        queryNode.add('RETURNING', this.returningNodes);
      }
      return queryNode.build(params);
    }
  })
  .compose(clauses('table'), where, clauses('returning'), clauses('from'));

module.exports = function (tableName) {
  return updateStamp()
    .table(tableName);
};