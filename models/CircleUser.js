const bookshelf = require('../bookshelf');
const circle = require('./Circle');
const post = require('./Post');

module.exports = bookshelf.Model.extend({
  tableName: 'circle_users',
  circle: function() {
    return this.belongsTo(circle);
  },
  post: function() {
    return this.hasMany(post, 'circle_id', 'circle_id');
  }
})
