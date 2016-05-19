const stampit = require('stampit');
const nodes = require('../lib/nodes');

const conditionStamp = stampit()
  .init(function () {
    this.conditions = nodes.compositeNode();
  })
  .methods({
    or(){
      this.conditions.add(nodes.valueNode('OR'));
      return this.if(...arguments);
    },
    and(){
      this.conditions.add(nodes.valueNode('AND'));
      return this.if(...arguments);
    },
    if(leftOperand, ...args){
      if (args.length === 1) {
        args.unshift('=')
      }
      if (leftOperand.build && typeof leftOperand.build === 'function') {
        this.conditions.add(nodes.expressionNode(leftOperand.build().text));
      } else {
        const [operator,rightOperand] = args;
        const leftOperandNode = nodes.pointerNode(leftOperand);
        const operatorNode = nodes.valueNode(operator);
        const rightOperandNode = nodes.castNode(rightOperand);
        const whereNode = nodes.compositeNode({separator: ''});
        whereNode.add(leftOperandNode, operatorNode, rightOperandNode);
        this.conditions.add(whereNode);
      }
      return this;
    },
    build(params = {}, offset = 1){
      return this.conditions.build(params, offset);
    }
  });

module.exports = conditionStamp;