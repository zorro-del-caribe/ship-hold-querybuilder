const stampit = require('stampit');

function wrap (string, quote = '"') {
  const reg = /\'(.*)\'|"(.*)"|\((.*)\)|^\$/;
  return reg.test(string) || string === '*' ? string : quote + string + quote;
}

function buildFactory (func) {
  return function (params = {}, offset = 1) {
    const values = [];
    const value = this.node.value;
    const reg = /^\$/;
    const isParam = reg.test(value);
    const text = isParam === true ? '$' + offset : func(value);
    if (isParam === true) {
      const propName = value.substr(1);
      values.push(params[propName]);
    }
    return {text, values};
  }
}

const defaultNode = stampit()
  .init(function () {
    if (!this.node) {
      throw new Error('node can only be created with a node value object');
    }
    //make the node data object immutable (but still readable)
    const node = this.node;
    delete this.node;
    Object.freeze(node);
    Object.defineProperty(this, 'node', {
      get(){
        return Object.assign({}, node);
      }
    });
  })
  .methods({
    build: buildFactory(val=>val)
  });

const pointerNode = defaultNode.compose(stampit()
  .methods({
    build(){
      const value = this.node.value.split('.').map(p=>wrap(p)).join('.');
      const text = this.node.as ? [value, 'AS', wrap(this.node.as)].join(' ') : value;
      return {text, values: []}
    }
  }));

const compositeNode = stampit()
  .init(function () {
    Object.defineProperty(this, 'length', {
      get(){
        return this.nodes.length
      }
    });
  })
  .props({nodes: [], separator: ' '})
  .methods({
    add(...args){
      const nodeArgs = args.map(n => n.build && typeof n.build === 'function' ? n : defaultNode({node: {value: n}}));
      this.nodes.push(...nodeArgs);
      return this;
    },
    build(params = {}, offset = 1){
      const agg = this.nodes.reduce((previous, current)=> {
        const {text:newText, values:newVals=[]} = current.build(params, previous.offset);
        return {
          text: previous.text.concat(newText),
          values: previous.values.concat(newVals),
          offset: previous.offset + newVals.length
        }
      }, {offset, text: [], values: []});
      return {
        text: agg.text.join(this.separator),
        values: agg.values
      };
    }
  });

const castNode = defaultNode.compose(stampit()
  .methods({
    build: buildFactory(value=>wrap(value.toString(), "'"))
  }));

const expressionNode = defaultNode.compose(stampit()
  .methods({
    build(params = {}, offset = 1){
      return {text: '(' + this.node.value + ')', values: []};
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


