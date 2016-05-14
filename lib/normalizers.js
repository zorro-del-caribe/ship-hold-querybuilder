const stampit = require('stampit');

function quoteWrap (string, quote = '"') {
  const reg = /"(.*)"/i;
  return reg.test(string) || string === '*' ? string : quote + string + quote;
}

exports.quoteWrapperNormalizer = stampit()
  .methods({
    normalize(node){
      const inputValue = node.value;
      const parts = inputValue.split('.');
      const outputValue = parts.map(p=>quoteWrap(p)).join('.');
      return Object.assign({}, node, {value: outputValue});
    }
  });

exports.labelNormalizer = stampit()
  .methods({
    normalize(node){
      return node.as ? Object.assign({}, node, {as: quoteWrap(node.as)}) : node;
    }
  });

exports.castNormalizer = stampit()
  .methods({
    normalize(node){
      const value = quoteWrap(node.value.toString(), "'");
      return Object.assign({}, node, {value});
    }
  });


