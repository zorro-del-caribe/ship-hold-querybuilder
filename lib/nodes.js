const stampit = require('stampit');

function wrap (string, quote = '"') {
  const reg = new RegExp(`${quote}(.*)${quote}`);
  return reg.test(string) || string === '*' ? string : quote + string + quote;
}

const defaultNode = stampit()
  .init(function () {
    if (!this.node) {
      throw new Error('node can only be created with a node value object');
    }
  })
  .methods({
    build(){
      return this.node.value;
    }
  });

const pointerNode = defaultNode.compose(stampit()
  .methods({
    build(){
      const value = this.node.value.split('.').map(p=>wrap(p)).join('.');
      return this.node.as ? [value, 'AS', wrap(this.node.as)].join(' ') : value;
    }
  }));

const compositeNode = stampit()
  .init(function () {
    Object.defineProperty(this, 'length', {
      get(){
        return this.nodes.length
      }
    })
  })
  .props({nodes: [], separator: ' '})
  .methods({
    add(){
      this.nodes.push(...arguments);
      return this;
    },
    build(){
      return this.nodes.map(n=>n.build()).join(this.separator);
    }
  });

const castNode = defaultNode.compose(stampit()
  .methods({
    build(){
      return wrap(this.node.value.toString(), "'");
    }
  }));

const expressionNode = defaultNode.compose(stampit()
  .methods({
    build(){
      return '(' + this.node.value + ')';
    }
  }));

exports.valueNode = function (params = {}) {
  const node = params.value === undefined ? {value: params} : params;
  return defaultNode({node});
};

exports.pointerNode = function (params = {}) {
  const node = params.value === undefined ? {value: params} : params;
  return pointerNode({node});
};

exports.castNode = function (params = {}) {
  const node = params.value === undefined ? {value: params} : params;
  return castNode({node});
};

exports.compositeNode = function (params = {}) {
  return compositeNode(params);
};

exports.expressionNode = function (params = {}) {
  const node = params.value === undefined ? {value: params} : params;
  return expressionNode({node});
};


