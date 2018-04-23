const bookshelf = require('../bookshelf');
const circleUser = require('./CircleUser');

module.exports = bookshelf.Model.extend({
  tableName: 'circles',
  circleUser: function() {
    return this.hasMany(circleUser);
  }
})
