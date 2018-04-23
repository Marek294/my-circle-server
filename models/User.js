const bookshelf = require('../bookshelf');
const post = require('./Post');
const commentary = require('./Commentary');

module.exports = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  post: function() {
    return this.hasMany(post);
  },
  commentary: function() {
    return this.hasMany(commentary);
  }
})
