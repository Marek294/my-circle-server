const bookshelf = require('../bookshelf');

module.exports = bookshelf.Model.extend({
  tableName: 'vote_history'
})
