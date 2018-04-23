const bookshelf = require('../bookshelf');
const user = require('./User');

module.exports = bookshelf.Model.extend({
  tableName: 'commentaries',
  user: function() {
    return this.belongsTo(user);
  }
})
