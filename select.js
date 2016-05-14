const stampit = require('stampit');
const nodes = require('./lib/nodes');
const where = require('./where');

const select = stampit()
  .init(function () {
    this.selectNodes = nodes.compositeNode({separator: ', '});
    this.tableNodes = nodes.compositeNode({separator: ', '});
    this.whereNodes = nodes.compositeNode();
    this.orderByNodes = nodes.compositeNode();
    this.limitNodes = nodes.compositeNode();
  })
  .methods({
    select(){
      const args = [...arguments];
      this.selectNodes.add(...args.map(a=>nodes.pointerNode(a)));
      return this;
    },
    table(){
      const args = [...arguments];
      this.tableNodes.add(...args.map(a=>nodes.pointerNode(a)));
      return this;
    },
    from(){
      return this.table(...[...arguments]);
    },
    build(){
      const queryNode = nodes.compositeNode();

      function eventuallyAdd (composite, keyWord) {
        if (composite.length) {
          queryNode.add(nodes.valueNode(keyWord.toUpperCase()), composite);
        }
      }

      eventuallyAdd(this.selectNodes, 'select');
      eventuallyAdd(this.tableNodes, 'from');
      eventuallyAdd(this.whereNodes, 'where');
      eventuallyAdd(this.orderByNodes, 'order by');
      eventuallyAdd(this.limitNodes, 'limit');
      return queryNode.build();
    },
    where(){
      const builder = this;
      const delegate = where()
        .where(...[...arguments]);
      const revocable = Proxy.revocable(delegate, {
        get(target, property, receiver){
          if (target[property]) {
            return target[property];
          } else {
            revocable.revoke();
            builder.whereNodes.add(...delegate.nodes.nodes);
            return builder[property].bind(builder);
          }
        }
      });
      return revocable.proxy;
    },
    orWhere(){
      const args = [...arguments];
      this.whereNodes.add(nodes.valueNode('OR'));
      return this.where(...args);
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
  });

module.exports = function () {
  const args = [...arguments];
  if (args.length === 0) {
    args.push('*');
  }
  return select()
    .select(...args);
};