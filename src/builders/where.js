const stampit = require('stampit');
const nodes = require('../lib/nodes');
const proxy = require('../lib/proxyCondition');

// where clause builder
module.exports = stampit()
  .init(function () {
    this.whereNodes = nodes.compositeNode();
  })
  .methods({
    where(){
      return proxy(this, this.whereNodes)(...arguments);
    }
  });