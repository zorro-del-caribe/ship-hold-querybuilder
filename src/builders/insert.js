const stampit = require('stampit');
const nodes = require('../lib/nodes');
const clause = require('./clause');

const insertStamp = stampit()
  .init(function () {
    this.valueNodes = nodes.compositeNode({separator: ', '});
  })
  .methods({
    value(prop, value){
      this.field(prop);
      this.valueNodes.add(value !== undefined ? nodes.valueNode(value) : nodes.identityNode('DEFAULT'));
      return this;
    },
    build(params = {}){
      const queryNode = nodes.compositeNode();
      queryNode.add('INSERT INTO', this.intoNodes, '(', this.fieldNodes, ')', 'VALUES', '(', this.valueNodes, ')');
      if (this.returningNodes.length) {
        queryNode.add('RETURNING', this.returningNodes);
      }
      return queryNode.build(params);
    }
  })
  .compose(clause('into'), clause('field'), clause('returning'));

module.exports = function (map = {}) {
  const builder = insertStamp();
  for (const prop of Object.getOwnPropertyNames(map)) {
    const value = map[prop];
    builder.value(prop, value);
  }
  return builder;
};