const stampit = require('stampit');
const nodes = require('./lib/nodes');

const whereStamp = stampit()
  .init(function () {
    this.nodes = nodes.compositeNode();
  })
  .methods({
    or(){
      this.nodes.add(nodes.valueNode('OR'));
      return this.where(...[...arguments]);
    },
    and(){
      this.nodes.add(nodes.valueNode('AND'));
      return this.where(...[...arguments]);
    },
    where(){
      const args = [...arguments];
      if (args.length !== 3) {
        args.splice(1, 0, '=');
      }
      const leftOperandNode = nodes.pointerNode(args[0]);
      const operatorNode = nodes.valueNode(args[1]);
      const rightOperandNode = nodes.castNode(args[2]);
      const whereNode = nodes.compositeNode({separator: ''});
      whereNode.add(leftOperandNode, operatorNode, rightOperandNode);
      this.nodes.add(whereNode);
      return this;
    }
  });

module.exports = whereStamp;