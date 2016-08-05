const stampit = require('stampit');

// node that returns its own value when built
exports.identityNode = function (params = {}) {
  const node = params.value === undefined ? {value: params} : params;
  return defaultNode({node});
};

// node that returns a sql identifier when built
exports.pointerNode = function (params = {}) {
  const node = params.value === undefined ? {value: params} : params;
  return pointerNode({node});
};

// node that returns a scalar value when built
exports.valueNode = function (params = {}) {
  const node = params === null || params.value === undefined ? {value: params} : params;
  return valueNode({node});
};

// node made of nodes
exports.compositeNode = function (params = {}) {
  return compositeNode(params);
};

// node made from a sub builder (for subquery)
exports.expressionNode = function (params = {}) {
  const node = params.value === undefined ? {value: params} : params;
  return expressionNode({node});
};

function testWrap (input) {
  const reg = /\'(.*)\'|"(.*)"|\((.*)\)|^\$/;
  return reg.test(input);
}

function wrap (string, quote = '"') {
  return testWrap(string) || string === '*' ? string : quote + string + quote;
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
    const node = this.node;
    delete this.node;
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
      let val;
      if (testWrap(this.node.value)) {
        val = this.node.value;
      } else {
        const [first, ...rest] = this.node.value.split('.');
        const parts = [wrap(first)];
        if (rest.length) {
          parts.push(wrap(rest.join('.')));
        }
        val = parts.join('.');
      }
      const value = this.node.fn ? `${this.node.fn}(${val})` : val;
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
    this[Symbol.iterator] = function * () {
      for (const n of this.nodes) {
        if (n[Symbol.iterator] !== undefined) {
          yield *n;
        } else {
          yield n.node;
        }
      }
    }
  })
  .props({nodes: [], separator: ' '})
  .methods({
    add(...args){
      const nodeArgs = args.map(n => n.build && typeof n.build === 'function' ? n : defaultNode({node: {value: n}}));
      this.nodes.push(...nodeArgs);
      return this;
    },
    build(params = {}, offset = 1){
      let off = offset;
      const text = [];
      const values = [];
      for (const node of this.nodes) {
        const {text:newText, values:newVals = []}=node.build(params, off);
        text.push(newText);
        values.push(...newVals);
        off += newVals.length;
      }
      return {
        text: text.join(this.separator),
        values: values
      };
    }
  });

function parseValue (value) {
  switch (typeof value) {
    case 'string':
      return wrap(value, "'");
    case 'object': {
      if (value === null) {
        return 'NULL'
      } else if (Array.isArray(value)) {
        return '(' + value.map(parseValue).join(',') + ')';
      } else if (value.toISOString) {
        return wrap(value.toISOString(), "'");
      } else {
        return `'${JSON.stringify(value)}'`;
      }
    }
    default:
      return value;
  }
}

const valueNode = defaultNode.compose(stampit()
  .methods({
    build: buildFactory(parseValue)
  }));

const expressionNode = stampit()
  .methods({
    build(params = {}, offset = 1){
      const {text, values} = this.node.value.build(params, offset);
      const fullText = this.node.as ? [`(${text})`, 'AS', wrap(this.node.as)].join(' ') : `(${text})`;
      return {text: fullText, values};
    }
  });