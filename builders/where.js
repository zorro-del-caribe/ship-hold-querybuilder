const conditions = require('./conditions');
const stampit = require('stampit');
const nodes = require('../lib/nodes');

module.exports = stampit()
  .init(function () {
    this.whereNodes = nodes.compositeNode();
  })
  .methods({
    where(){
      const builder = this;
      const delegate = conditions()
        .where(...arguments);
      const revocable = Proxy.revocable(delegate, {
        get(target, property, receiver){
          if (target[property] && property !== 'build') {
            return target[property];
          } else {
            builder.whereNodes.add(...delegate.conditions.nodes);
            return builder[property].bind(builder);
          }
        }
      });
      return revocable.proxy;
    }
  });