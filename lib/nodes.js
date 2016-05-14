const stampit = require('stampit');
const normalizers = require('./normalizers');

const defaultNode = stampit()
  .props({normalizers: []})
  .init(function () {
    if (!this.node) {
      throw new Error('node can only be created with a node value object');
    }
  })
  .methods({
    normalize(){
      return this.normalizers.reduce((previous, current)=> {
        return current.normalize(previous);
      }, this.node);
    },
    build(){
      return this.normalize().value;
    }
  });

const pointerNode = stampit.compose(
  defaultNode,
  stampit()
    .init(function () {
      this.normalizers.push(normalizers.labelNormalizer(), normalizers.quoteWrapperNormalizer());
    })
    .methods({
      build(){
        const normalized = this.normalize();
        return normalized.as ? [normalized.value, 'AS', normalized.as].join(' ') : normalized.value;
      }
    }));

const compositeNode = stampit()
  .init(function () {
    Object.defineProperty(this,'length',{
      get(){return this.nodes.length}
    })
  })
  .props({nodes: [], separator: ' '})
  .methods({
    add(){
      this.nodes.push(...arguments);
      return this;
    },
    normalize(){
      return this.nodes.map(n=>n.normalize());
    },
    build(){
      return this.nodes.map(n=>n.build()).join(this.separator);
    },
  });

const castNode = stampit
  .compose(defaultNode,
    stampit()
      .init(function () {
        this.normalizers.push(normalizers.castNormalizer());
      })
  );

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


