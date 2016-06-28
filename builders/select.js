const stampit = require('stampit');
const nodes = require('../lib/nodes');
const conditions = require('./conditions');
const clause = require('./clause');
const where = require('./where');
const proxy = require('../lib/proxyCondition');

function joinFunc (joinType = 'JOIN') {
  return function (table, leftOperand, rightOperand) {
    const isSubQuery = node => node.value && node.value.build && typeof node.value.build === 'function';
    const node = isSubQuery(table) ? nodes.expressionNode(table) : nodes.pointerNode(table);
    this.joinNodes.add(nodes.identityNode(joinType), node);
    return leftOperand && rightOperand ? this.on(leftOperand, rightOperand) : this;
  }
}

//select query builder
const select = stampit()
  .init(function () {
    this.orderByNodes = nodes.compositeNode({separator:', '});
    this.limitNodes = nodes.compositeNode();
    this.joinNodes = nodes.compositeNode();
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
      if (this.joinNodes.length) {
        queryNode.add(this.joinNodes);
      }
      eventuallyAdd(this.whereNodes, 'where');
      eventuallyAdd(this.orderByNodes, 'order by');
      eventuallyAdd(this.limitNodes, 'limit');
      return queryNode.build(params);
    },
    join: joinFunc(),
    leftJoin: joinFunc('LEFT JOIN'),
    rightJoin: joinFunc('RIGHT JOIN'),
    fullJoin: joinFunc('FULL JOIN'),
    on(){
      //todo throw exception if last join nodes is not a identity node
      this.joinNodes.add('ON');
      return proxy(this, this.joinNodes)(...arguments);
    },
    orderBy(column, direction){
      const newOrderByNode = nodes.compositeNode();
      newOrderByNode.add(nodes.pointerNode(column));
      const actualDirection = (direction && direction.toString() || '').toLowerCase();
      if (actualDirection === 'asc' || actualDirection === 'desc') {
        newOrderByNode.add(nodes.identityNode(actualDirection.toUpperCase()));
      }
      this.orderByNodes.add(newOrderByNode);
      return this;
    },
    limit(l, offset){
      this.limitNodes.add(nodes.valueNode(l));
      if (offset) {
        this.limitNodes.add(nodes.identityNode('OFFSET'), nodes.valueNode(offset));
      }
      return this;
    },
    noop(){
      return this;// useful for revoking proxy
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