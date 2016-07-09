const stampit = require('stampit');
const nodes = require('../lib/nodes');

// builder to create conditional statement with left Operand, operator and right operand
const conditionStamp = stampit()
  .init(function () {
    this.conditions = nodes.compositeNode();
  })
  .methods({
    or(){
      this.conditions.add(nodes.identityNode('OR'));
      return this.if(...arguments);
    },
    and(){
      this.conditions.add(nodes.identityNode('AND'));
      return this.if(...arguments);
    },
    if(leftOperand, ...args){

      const leftOperandNode = isNode(leftOperand) ? nodes.expressionNode(leftOperand) : nodes.pointerNode(leftOperand);

      if (args.length === 0) {
        this.conditions.add(leftOperandNode);
      } else {
        if (args.length === 1) {
          args.unshift('=');
        }
        const [operator,rightOperand] = args;
        const operatorNode = nodes.identityNode(operator);
        const rightOperandNode = isNode(rightOperand) ? nodes.expressionNode(rightOperand) : nodes.valueNode(rightOperand);
        const whereNode = nodes.compositeNode({separator: ' '})
          .add(leftOperandNode, operatorNode, rightOperandNode);
        this.conditions.add(whereNode);
      }
      return this;

      function isNode (val) {
        return val.build && typeof val.build === 'function';
      }
    },
    build(params = {}, offset = 1){
      return this.conditions.build(params, offset);
    }
  });

module.exports = conditionStamp;