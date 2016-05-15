const stampit = require('stampit');
const nodes = require('../lib/nodes');

const conditionStamp = stampit()
  .init(function () {
    this.conditions = nodes.compositeNode();
  })
  .methods({
    or(){
      this.conditions.add(nodes.valueNode('OR'));
      return this.where(...[...arguments]);
    },
    and(){
      this.conditions.add(nodes.valueNode('AND'));
      return this.where(...[...arguments]);
    },
    where(){
      const args = [...arguments];
      if (args.length === 2) {
        args.splice(1, 0, '=');
      }
      if (args.length === 1 && args[0].build && typeof args[0].build === 'function') {
        this.conditions.add(nodes.expressionNode(args[0].build()));
      } else {
        const leftOperandNode = nodes.pointerNode(args[0]);
        const operatorNode = nodes.valueNode(args[1]);
        const rightOperandNode = nodes.castNode(args[2]);
        const whereNode = nodes.compositeNode({separator: ''});
        whereNode.add(leftOperandNode, operatorNode, rightOperandNode);
        this.conditions.add(whereNode);
      }
      return this;
    },
    build(){
      return this.conditions.build();
    }
  });

module.exports = conditionStamp;