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
        this[nodeProp].add(...args.map(n=>n.build && typeof n.build === 'function' ? nodes.expressionNode(n) : nodes.pointerNode(n)));
        return this;
      }
    });
};