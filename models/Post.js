const bookshelf = require('../bookshelf');
const circleUser = require('./CircleUser');
const commentary = require('./Commentary');
const voteHistory = require('./VoteHistory');
const user = require('./User');

bookshelf.plugin('pagination');

module.exports = bookshelf.Model.extend({
  tableName: 'posts',
  circleUser: function() {
    return this.belongsTo(circleUser);
  },
  user: function() {
    return this.belongsTo(user);
  },
  commentary: function() {
    return this.hasMany(commentary);
  },
  voteHistory: function () {
    return this.hasMany(voteHistory);
  }
})
