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
        .if(...arguments);
      delegate.builder = this;

      const revocable = Proxy.revocable(delegate, {
        get(target, property, receiver){
          if (target[property] && property !== 'build') {
            return target[property];
          } else {
            const func = target.builder[property].bind(target.builder);
            target.builder.whereNodes.add(...target.conditions.nodes);
            target.builder = null;
            revocable.revoke();
            return func;
          }
        }
      });
      return revocable.proxy;
    }
  });