const stampit = require('stampit');
const nodes = require('../lib/nodes');
const conditions = require('./conditions');
const clause = require('./clause');
const where = require('./where');

const select = stampit()
  .init(function () {
    this.orderByNodes = nodes.compositeNode();
    this.limitNodes = nodes.compositeNode();
  })
  .methods({
    build(params = {}){
      const queryNode = nodes.compositeNode();

      function eventuallyAdd (composite, keyWord) {
        if (composite.length) {
          queryNode.add(keyWord.toUpperCase(), composite);
        }
      }

      eventuallyAdd(this.selectNodes, 'select');
      eventuallyAdd(this.fromNodes, 'from');
      eventuallyAdd(this.whereNodes, 'where');
      eventuallyAdd(this.orderByNodes, 'order by');
      eventuallyAdd(this.limitNodes, 'limit');
      return queryNode.build(params);
    },
    orderBy(column, direction){
      this.orderByNodes.add(nodes.pointerNode(column));
      const actualDirection = (direction && direction.toString() || '').toLowerCase();
      if (actualDirection === 'asc' || actualDirection === 'desc') {
        this.orderByNodes.add(nodes.valueNode(actualDirection.toUpperCase()));
      }
      return this;
    },
    limit(l, offset){
      this.limitNodes.add(nodes.castNode(l));
      if (offset) {
        this.limitNodes.add(nodes.valueNode('OFFSET'), nodes.castNode(offset));
      }
      return this;
    }
  })
  .compose(clause('from'), clause('select'), where);

module.exports = function (...args) {
  if (args.length === 0) {
    args.push('*');
  }
  return select()
    .select(...args);
};