const express = require('express');
const authenticate = require('../middlewares/authenticate');

const postValidation = require('../validations/post');
const postUpdateValidation = require('../validations/postUpdate');
const votePostValidation = require('../validations/votePostValidation');

const CircleUser = require('../models/circleUser');
const Post = require('../models/post');
const voteHistory = require('../models/voteHistory');
const Commentary = require('../models/commentary');
const User = require('../models/user');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  CircleUser.query({
    where: { user_id: req.currentUser.id}
  }).fetchAll({withRelated: ['post','circle']}).then(circleUsers => {
      var response = [];

      circleUsers.map(circleUser => {
        circleUser.relations.post.map(post => {
          response.push(post);
        });
      });

      res.json(response);
  });
});

router.get('/:circleId', authenticate, (req, res) => {
  CircleUser.query({
    where: {circle_id: req.params.circleId},
    andWhere: { user_id: req.currentUser.id}
  }).fetch().then(user => {
    if(user)
      Post.query({
        where: {circle_id: req.params.circleId}
      }).fetchAll({ withRelated: ['user']}).then(posts => {
        var responsePosts = [];
        var tmp = {};

        posts.map(post => {
          tmp.username = post.relations.user.attributes.username;
          responsePosts.push(Object.assign({}, post.attributes, tmp));
        });

        res.json(responsePosts);
      });
    else res.status(403).json({errors: "You are not this circle's member"});
  })
});

router.get('/:circleId/:pageSize/:page', authenticate, (req, res) => {
  CircleUser.query({
    where: {circle_id: req.params.circleId},
    andWhere: { user_id: req.currentUser.id}
  }).fetch().then(user => {
    if(user)
      Post.query({
        where: {circle_id: req.params.circleId}
      }).orderBy('created_at', 'DESC').fetchPage({pageSize: req.params.pageSize, page: req.params.page, withRelated: ['user']}).then(posts => {
        //console.log(posts.pagination.pageCount);
        var responsePosts = [];
        var tmp = {};

        posts.map(post => {
          tmp.username = post.relations.user.attributes.username;
          responsePosts.push(Object.assign({}, post.attributes, tmp));
        });

        res.json({remainingPages: posts.pagination.pageCount - req.params.page, posts: responsePosts});
      });
    else res.status(403).json({errors: "You are not this circle's member"});
  })
});


router.post('/', authenticate, (req, res) => {
  let { errors, isValid } = postValidation(req.body);
  if(isValid) {
    const { circleId, title, content } = req.body;

    CircleUser.query({
      where: {circle_id: circleId},
      andWhere: { user_id: req.currentUser.id}
    }).fetch().then(user => {
      if(user)
        User.query({
          where: { id: req.currentUser.id }
        }).fetch().then(userWithUsername => {

          Post.forge({
              circle_id: circleId,
              user_id: req.currentUser.id,
              title,
              content },
            { hasTimestamps: true }).save()
            .then(post => {
              var responsePost = post.attributes;
              responsePost.username = userWithUsername.get('username');
              res.json(responsePost);
            })
            .catch(err => {
              console.log(err);
              res.status(500).json(err);
            });

        });

      else res.status(403).json({errors: "You are not this circle's member"});
    })
  } else res.status(403).json(errors);
});

router.put('/:id', authenticate, (req, res) => {
  let { errors, isValid } = postUpdateValidation(req.body);
  if(isValid) {
    const saveObject = {};
    saveObject.content = req.body.content;
    saveObject.title = req.body.title;

    Post.query({
      where: {id: req.params.id},
      andWhere: {user_id: req.currentUser.id}
    }).fetch()
      .then(post => {
        if(post) {
          post.save(saveObject);
          return res.json(Object.assign({}, post.attributes, saveObject));
        } else res.status(403).json({error: 'You are not able to edit this post or there is no post with such id'});
      })
      .catch(err => {
        res.status(500).json(err);
      });
  } else res.status(500).json(errors);
});

router.delete('/:id', authenticate, (req, res) => {
    Post.query({
      where: {id: req.params.id},
      andWhere: {user_id: req.currentUser.id}
    }).fetch()
      .then(post => {
        if(post) {
          return CircleUser.query({
            where: { circle_id: post.get('circle_id') },
            andWhere: { user_id: req.currentUser.id }
          }).fetch().then(circleUser => {
            if(post.get('user_id') == req.currentUser.id || circleUser.get('is_admin')) {

              Commentary.query({
                where: { post_id: post.get('id') }
              }).fetchAll().then(comments => {
                return comments.map(comment => {
                  comment.destroy();
                });
              });

              voteHistory.query({
                where: { post_id: post.get('id') }
              }).fetchAll().then(histories => {
                return histories.map(history => {
                  history.destroy();
                });
              });

              post.destroy();
              return res.json(post);
            } else res.status(403).json({error: 'You are not able to delete this post'});
          });
        } else res.status(403).json({error: 'There is no post with such id'});
      })
      .catch(err => {
        res.status(500).json(err);
      });
});

router.get('/vote/:postId', authenticate, (req,res) => {
  voteHistory.query({
    where: { post_id: req.params.postId},
    andWhere: { user_id: req.currentUser.id}
  }).fetch().then(vote => {
      res.json(vote);
  })
});

router.post('/vote', authenticate, (req, res) => {
  let { errors, isValid } = votePostValidation(req.body);

  if(isValid) {
    const {postId, voteType} = req.body;

    Post.query({
      where: { id: postId }
    }).fetch({withRelated: ['user']}).then(post => {
      if(post) {
        CircleUser.query({
          where: {user_id: req.currentUser.id},
          andWhere: {circle_id: post.get('circle_id')}
        }).fetch().then(circleUser => {
          if (circleUser) {
            voteHistory.query({
              where: { post_id: post.get('id')},
              andWhere: { user_id: req.currentUser.id}
            }).fetch().then(history => {
              var votes = post.get('vote_summary');

              if(!history) { // add vote
                if(voteType == 'plus') votes++;
                if(voteType == 'minus') votes--;

                voteHistory.forge({
                  user_id: req.currentUser.id,
                  post_id: post.get('id'),
                  type: voteType
                }, {hasTimestamps: true}).save()
                  .catch(err => {
                    res.status(500).json(err);
                  });

              } else {
                if( history.get('type') != voteType ) {   // change type of vote

                  if(voteType == 'plus') votes += 2;
                  if(voteType == 'minus') votes -= 2;

                  history.set({ type: voteType });
                  history.save();

                }
                else { // cancel vote
                  if(voteType == 'plus') votes -= 1;
                  if(voteType == 'minus') votes += 1;

                  history.destroy();
                }
              }

              post.set({vote_summary: votes});
              post.save();

              res.json(post);
            });
          } else res.status(403).json({errors: 'You are not allowed to vote this post'});
        })
      } else res.status(403).json({errors: 'There is no post with such id'});
    })
  } else res.status(403).json(errors);
});

module.exports = router;
