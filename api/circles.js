const express = require('express');
const authenticate = require('../middlewares/authenticate');

const circleValidation = require('../validations/circle');
const circleUserValidation = require('../validations/circleUser');

const Circle = require('../models/circle');
const CircleUser = require('../models/circleUser');
const User = require('../models/user');

const functions = require('./functions');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  Circle.query({
    where: { owner_id: req.currentUser.id }
  }).fetchAll().then((circles) => {
        CircleUser.query({
          where: { user_id: req.currentUser.id }
        }).fetchAll({withRelated: ['circle']})
          .then(userCircles => {
                var circlesResponse = [];
                var index = [];

                circles.map(circle => {
                  circlesResponse.push(circle.attributes);
                  index.push(circle.id);
                });

                userCircles.map(userCircle => {
                  if(index.indexOf(userCircle.relations.circle.id) == -1) {
                    circlesResponse.push(userCircle.relations.circle);
                    index.push(userCircle.relations.circle.id);
                  }
                });

                res.json(circlesResponse);
      });
  })
});

router.get('/:id', authenticate, (req, res) => {
  Circle.query({
    where: { id: req.params.id }
  }).fetch().then((circle) => {
    res.json(circle);
  })
});


router.post('/', authenticate, (req, res) => {
  let { errors, isValid } = circleValidation(req.body);
  if(isValid) {
    const {name, isPublic} = req.body;
      functions.addCircle(name, isPublic, req, res);
  } else res.status(403).json(errors);
});

router.get('/user/:circleId/isAdmin', authenticate, (req, res) => {
  CircleUser.query({
    where: { circle_id: req.params.circleId },
    andWhere: { user_id: req.currentUser.id }
  }).fetch().then(circleUser => {
    if(circleUser) {
      res.json({isAdmin: circleUser.get('is_admin')});
    } else {
      res.status(403).json({errors: 'There is no user at this circle'});
    }
  })
});

router.get('/user/:circleId', authenticate, (req, res) => {
    CircleUser.query({
      where: { circle_id: req.params.circleId },
      andWhere: { user_id: req.currentUser.id }
    }).fetch().then(user => {
      if(user) {
          CircleUser.query({
            where: {circle_id: req.params.circleId}
          }).fetchAll().then(circleUsers => {
            var idArray = [];

            circleUsers.map(circleUser => {
              if(circleUser.get('user_id') != req.currentUser.id) idArray.push(circleUser.get('user_id'));
            });

            User.query('whereIn', 'id', idArray).fetchAll({columns: ['id', 'username', 'email', 'image_url']}).then(usersInCircle => {
              res.json(usersInCircle);
            })
          });
      } else res.status(403).json({errors: "There is no user in this circle with such id"});
    })
});

router.get('/userNotIn/:circleId', authenticate, (req, res) => {
  CircleUser.query({
    where: { circle_id: req.params.circleId },
    andWhere: { user_id: req.currentUser.id }
  }).fetch().then(user => {
    if(user) {
      if (user.get('is_admin')) {
        CircleUser.query({
          where: {circle_id: req.params.circleId}
        }).fetchAll().then(circleUsers => {
          var idArray = [];

          circleUsers.map(circleUser => {
            idArray.push(circleUser.get('user_id'));
          });

          User.query('whereNotIn', 'id', idArray).fetchAll({columns: ['id', 'username', 'email', 'image_url']}).then(usersNotInCircle => {
            res.json(usersNotInCircle);
          })
        });
      }
      else res.status(403).json({errors: "You are not allowed to list users not in this circle"});
    } else res.status(403).json({errors: "There is no user in this circle with such id"});
  })
});

router.get('/user/leave/:circleId', authenticate, (req,res) => {
  CircleUser.query({
    where: {user_id: req.currentUser.id},
    andWhere: {circle_id: req.params.circleId}
  }).fetch()
    .then(circleUser => {
      if (circleUser) {
      Circle.query({
        where: { id: req.params.circleId }
      }).fetch().then(circle => {
          if(circle.get('owner_id') == req.currentUser.id) {
            circle.set({owner_id: 0});
            circle.save();
          }

          circleUser.destroy();
          res.json({success: true});
      });
      } else res.status(403).json({errors: "You are not this circle member"});
    });
});

router.post('/user', authenticate, (req, res) => {
  let { errors, isValid } = circleUserValidation(req.body);

  if(isValid) {
    const {circleId, userId, isAdmin} = req.body;
    CircleUser.query({
      where: {user_id: req.currentUser.id},
      andWhere: {circle_id: circleId}
    }).fetch()
      .then(circleUser => {
        if (circleUser && circleUser.get('is_admin')) {
          functions.addUserToCircle(circleUser.get('circle_id'), userId, isAdmin, req, res);
        } else res.status(403).json({errors: "You are not allowed to add this user to this circle"});
      });
  } else res.status(403).json(errors);
});

router.post('/user/add', authenticate, (req, res) => {
    const {circleId, usernameOrEmail, isAdmin} = req.body;
    CircleUser.query({
      where: {user_id: req.currentUser.id},
      andWhere: {circle_id: circleId}
    }).fetch()
      .then(circleUser => {
        if (circleUser && circleUser.get('is_admin')) {
          functions.addUserToCircleFrontEnd(circleUser.get('circle_id'), usernameOrEmail, isAdmin, req, res);
        } else res.status(403).json({errors: "You are not allowed to add this user to this circle"});
      });
});

router.delete('/user/:circleId/:userId', authenticate, (req, res) => {
  CircleUser.query({
    where: { circle_id: req.params.circleId },
    andWhere: { user_id: req.currentUser.id }
  }).fetch().then(user => {
    if(user) {
      if (user.get('is_admin')) {
        CircleUser.query({
          where: {circle_id: req.params.circleId},
          andWhere: { user_id: req.params.userId}
        }).fetch().then(circleUser => {
            circleUser.destroy();
            res.json(circleUser);
        });
      }
      else res.status(403).json({errors: "You are not allowed to delete this user from this circle"});
    } else res.status(403).json({errors: "There is no user in this circle with such id"});
  })
});

router.put('/:id', authenticate, (req, res) => {
  const {name, isPublic} = req.body;
  functions.updateCircle(name, isPublic, req, res);
});

router.delete('/:id', authenticate, (req, res) => {
  functions.deleteCircle(req,res);
});

module.exports = router;
