const express = require('express');
const authenticate = require('../middlewares/authenticate');

const Commentary = require('../models/commentary');
const CircleUser = require('../models/circleUser');
const Post = require('../models/post');

const commentaryValidation = require('../validations/commentary');
const updateCommentaryValidation = require('../validations/updateCommentary');

const router = express.Router();

router.get('/:postId', authenticate, (req, res) => {
  Post.query({
    where: { id: req.params.postId}
  }).fetch({withRelated: ['user']}).then(post => {
    Commentary.query({
      where: { post_id: req.params.postId }
    }).fetchAll({withRelated: ['user']}).then(commentaries => {
      var comments = [];

      commentaries.map(commentary => {
        var tmp = commentary.attributes;
        tmp['username'] = commentary.related('user').get('username');

        comments.push(tmp);
      });

      post.set({username: post.related('user').get('username')});
      delete post.relations.user;
      res.json({post: post, commentaries: comments});
    })
  })
});

router.post('/', authenticate, (req,res) => {
  const { errors, isValid } = commentaryValidation(req.body);

  if(isValid) {
    const { postId, content } = req.body;

   Post.query({
     where: { id: postId }
   }).fetch().then(post => {
     if(post) {
       CircleUser.query({
         where: { circle_id: post.get('circle_id') },
         andWhere: { user_id: req.currentUser.id }
       }).fetch().then(circleUser => {
         if(circleUser){

           Commentary.forge({
             user_id: req.currentUser.id,
             post_id: postId,
             content: content
           }, {hasTimestamps: true}).save()
             .then(commentary => {
               res.json(commentary);
             })
             .catch(err => {
               res.status(500).json(err);
             });

         } else res.status(403).json({errors: 'You are not allowed to add this commentary to that post'});
       })
     } else res.status(403).json({errors: 'There is no post with such id'});
   });

  } else res.status(403).json(errors);
});

router.put('/:id', authenticate, (req,res) => {
  const { errors, isValid } = updateCommentaryValidation(req.body);

  if(isValid) {
    const { postId, content } = req.body;

    Commentary.query({
      where: {id: req.params.id},
      andWhere: {post_id: postId}
    }).fetch().then(commentary => {
        if(commentary && commentary.get('user_id') == req.currentUser.id) {

        commentary.set({content});
        commentary.save();

        res.json(commentary);

        } else res.status(403).json({errors: 'There is no commentary with such id'});
    });

  } else res.status(403).json(errors);
});

router.delete('/:id', authenticate, (req, res) => {
  Commentary.query({
    where: {id: req.params.id}
  }).fetch().then(commentary => {
    if(commentary) {

      Post.query({
        where: {id: commentary.get('post_id')}
      }).fetch().then(post => {
        CircleUser.query({
          where: {circle_id: post.get('circle_id')},
          andWhere: {user_id: req.currentUser.id}
        }).fetch().then(circleUser => {
          if(commentary.get('user_id') == req.currentUser.id || circleUser.get('is_admin')) {
            commentary.destroy();
            res.json(commentary);
          } else res.status(403).json({errors: 'You are not allowed to delete this commentary'});
        })
      });
    } else res.status(403).json({errors: 'There is no commentary with such id'});
  });
});

module.exports = router;
