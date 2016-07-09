const stampit = require('stampit');
const nodes = require('../lib/nodes');

//manage namespaced clause (to be composed with)
module.exports = function factory (namespace) {
  const nodeProp = namespace + 'Nodes';
  return stampit()
    .init(function () {
      this[nodeProp] = nodes.compositeNode({separator: ', '});
    })
    .methods({
      [namespace]: function (...args) {
        const isSubQuery = node => node.value && node.value.build && typeof node.value.build === 'function';
        this[nodeProp].add(...args.map(n=>isSubQuery(n) ? nodes.expressionNode(n) : nodes.pointerNode(n)));
        return this;
      }
    });
};