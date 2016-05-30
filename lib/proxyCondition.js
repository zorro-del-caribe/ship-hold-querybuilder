const conditions = require('../builders/conditions');

// create a condition builder proxy which will be revoked as soon as the main builder is called
module.exports = function (mainBuilder, nodes) {
  return function () {
    const delegate = conditions()
      .if(...arguments);
    delegate.builder = mainBuilder;
    const revocable = Proxy.revocable(delegate, {
      get(target, property, receiver){
        if (target[property] && property !== 'build') {
          return target[property];
        } else {
          const func = target.builder[property].bind(target.builder);
          nodes.add(...target.conditions.nodes);
          target.builder = null;
          revocable.revoke();
          return func;
        }
      }
    });
    return revocable.proxy;
  }
};