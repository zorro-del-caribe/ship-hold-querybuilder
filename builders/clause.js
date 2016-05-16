const stampit = require('stampit');
const nodes = require('../lib/nodes');

module.exports = function factory (namespace) {
  const nodeProp = namespace + 'Nodes';
  return stampit()
    .init(function () {
      this[nodeProp] = nodes.compositeNode({separator: ', '});
    })
    .methods({
      [namespace]: function (...args) {
        this[nodeProp].add(...args.map(a=>nodes.pointerNode(a)));
        return this;
      }
    });
};