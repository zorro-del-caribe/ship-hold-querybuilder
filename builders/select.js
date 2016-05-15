const stampit = require('stampit');
const nodes = require('../lib/nodes');
const conditions = require('./conditions');
const clause = require('./clause');

const select = stampit()
  .init(function () {
    this.whereNodes = nodes.compositeNode();
    this.orderByNodes = nodes.compositeNode();
    this.limitNodes = nodes.compositeNode();
  })
  .methods({
    build(){
      const queryNode = nodes.compositeNode();

      function eventuallyAdd (composite, keyWord) {
        if (composite.length) {
          queryNode.add(nodes.valueNode(keyWord.toUpperCase()), composite);
        }
      }

      eventuallyAdd(this.selectNodes, 'select');
      eventuallyAdd(this.fromNodes, 'from');
      eventuallyAdd(this.whereNodes, 'where');
      eventuallyAdd(this.orderByNodes, 'order by');
      eventuallyAdd(this.limitNodes, 'limit');
      return queryNode.build();
    },
    where(){
      const builder = this;
      const delegate = conditions()
        .where(...arguments);
      const revocable = Proxy.revocable(delegate, {
        get(target, property, receiver){
          console.log(property);
          if (target[property] && property !== 'build') {
            return target[property];
          } else {
            builder.whereNodes.add(...delegate.conditions.nodes);
            return builder[property].bind(builder);
          }
        }
      });
      return revocable.proxy;
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
  .compose(clause('from'), clause('select'));

module.exports = function () {
  const args = [...arguments];
  if (args.length === 0) {
    args.push('*');
  }
  return select()
    .select(...args);
};