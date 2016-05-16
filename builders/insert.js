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
      this.valueNodes.add(value !== undefined ? nodes.castNode(value): nodes.valueNode('DEFAULT'));
      return this;
    },
    build(){
      const queryNode = nodes.compositeNode();
      const fieldExpression = this.fieldNodes.build();
      const valueExpression = this.valueNodes.build();
      queryNode.add('INSERT INTO', this.intoNodes, nodes.expressionNode(fieldExpression), 'VALUES', nodes.expressionNode(valueExpression));
      return queryNode.build();
    }
  })
  .compose(clause('into'))
  .compose(clause('field'));

module.exports = function (map = {}) {
  const builder = insertStamp();
  Object.getOwnPropertyNames(map)
    .forEach((prop)=> {
      const value = map[prop];
      builder.value(prop, value);
    });
  return builder;
};