const select = require('./select');
// const stampit = require('stampit');
setInterval(function () {
  const q = select()
    .from('users')
    .where('foo', 'bar')
    .and('blah', 'whoot')
    .or('age', '>', 50)
    .build();
}, 100);