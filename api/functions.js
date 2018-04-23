const Circle = require('../models/circle');
const CircleUser = require('../models/circleUser');
const Post = require('../models/post');
const Commentary = require('../models/commentary');
const VoteHistory = require('../models/voteHistory');
const User = require('../models/user');

module.exports = {
  addUserToCircle: function (circleId, userId, isAdmin, req, res) {
    CircleUser.query({
      where: { circle_id: circleId},
      andWhere: { user_id: userId}
    }).fetch()
      .then(circleUser => {
        if(circleUser) res.status(500).json({errors: "User is already added to circle"});
        else {
          CircleUser.forge({
            circle_id: circleId,
            user_id: userId,
            is_admin: isAdmin
          }, {hasTimestamps: true}).save()
            .then(circleUser => {
              res.json(circleUser);
            })
            .catch(err => {
              res.status(500).json(err);
            })
        }
      });
  },

  addUserToCircleFrontEnd: function (circleId, usernameOrEmail, isAdmin, req, res) {
    User.query({
      where: { username: usernameOrEmail },
      orWhere: { email: usernameOrEmail }
    }).fetch().then(user => {
      CircleUser.query({
        where: { circle_id: circleId},
        andWhere: { user_id: user.id }
      }).fetch()
        .then(circleUser => {
          if(circleUser) res.status(500).json({errors: "User is already added to circle"});
          else {
            CircleUser.forge({
              circle_id: circleId,
              user_id: user.id,
              is_admin: isAdmin
            }, {hasTimestamps: true}).save()
              .then(circleUser => {
                res.json(circleUser);
              })
              .catch(err => {
                res.status(500).json(err);
              })
          }
        });
    });
  },

  addCircle: function (name, isPublic, req, res) {
    Circle.forge({
      owner_id: req.currentUser.id,
      name: name,
      is_public: isPublic
    }, {hasTimestamps: true}).save()
      .then(circle => {
        CircleUser.forge({
          circle_id: circle.id,
          user_id: req.currentUser.id,
          is_admin: true
        }, {hasTimestamps: true}).save();

          return res.json(circle);

      })
      .catch(err => {
        res.status(500).json(err);
      })
  },

  updateCircle: function (name, isPublic, req, res) {
    Circle.query({
      where: {id: req.params.id},
      andWhere: {owner_id: req.currentUser.id}
    }).fetch()
      .then(circle => {
        if (circle) {

          circle.save({name: name, is_public: isPublic});
          circle.attributes.name = name;
          circle.attributes.is_public = isPublic;

          res.json(circle);
        }
        else res.status(500).json({errors: "There is no circle with such id or you are not owner"});
      })
      .catch(err => {
        res.status(500).json(err);
      })
  },

  deleteCircle: function (req, res) {
    Circle.query({
      where: {id: req.params.id},
      andWhere: {owner_id: req.currentUser.id}
    }).fetch()
      .then(circle => {
        if (circle) {
          //console.log(circle.attributes.id);
          const p1 = new Promise((resolve, reject) => CircleUser.query({
            where: {circle_id: circle.attributes.id}
          }).fetchAll().then(circleUsers => {
            const destroyedCircleUsers = circleUsers.map(circleUser => {
              return circleUser.destroy();
            });

            Promise.all(destroyedCircleUsers).then(() => circle.destroy().then(() => resolve()));
          }));

          const p2 = new Promise((resolve, reject) => Post.query({
            where: {circle_id: req.params.id}
          }).fetchAll().then(posts => {
            posts.map(post => {

              const pp1 = new Promise((resolve,reject) => Commentary.query({
                where: { post_id: post.get('id') }
              }).fetchAll().then(comments => {
                const destroyedComments = comments.map(comment => {
                  return comment.destroy();
                });

                Promise.all(destroyedComments).then(() => resolve());
              }));

              const pp2 = new Promise((resolve,reject) => VoteHistory.query({
                where: { post_id: post.get('id') }
              }).fetchAll().then(histories => {
                const destroyedHistories = histories.map(history => {
                  return history.destroy();
                });

                Promise.all(destroyedHistories).then(() => resolve());
              }));

              Promise.all([pp1, pp2]).then(() => post.destroy().then(() => resolve()));
            })
          }));

          Promise.all([p1, p2]).then(() => res.json(circle));
        } else {
          res.status(500).json({errors: "There is no circle with such id or you are not owner"});
        }
      })
      .catch(err => {
        res.status(500).json(err);
      })
  }
}
