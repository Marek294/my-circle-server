'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const config = require('../config');
const authenticate = require('../middlewares/authenticate');

const signupValidations = require('../validations/signup');

const updateValidations = require('../validations/update');

const User = require('../models/user');

const router = express.Router();

var storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/avatars/');
  },
  filename(req, file, cb) {
    var ext = file.originalname.split('.');
    ext = ext[ext.length - 1];
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  }
});

var upload = multer({ storage });

router.get('/', (req, res) => {
  User.query({
    where: {role: 'user'}
  }).fetchAll()
    .then(users => {
      res.json(users);
    });
});

router.get('/me', authenticate, (req, res) => {
  res.json(req.currentUser);
});

router.post('/', (req, res) => {
  let { errors, isValid } = signupValidations(req.body);
  if(isValid) {
    const { username, email, password } = req.body;

    const password_digest = bcrypt.hashSync(password, 10);

    User.forge({ username, email, password_digest }, { hasTimestamps: true }).save()
      .then(user => {
        const token = jwt.sign({
          id: user.get('id'),
          username: user.get('username'),
          role: user.get('role')
        }, config.jwtSecret);

        res.json({token});
      })
      .catch(err => {
        res.status(500).json(err);
      });
  } else res.status(403).json(errors);
});

router.put('/', authenticate, (req, res) => {
  let { errors, isValid } = updateValidations(req.body);
  if(isValid) {
    const saveObject = req.body;

    if(saveObject.password) {
      saveObject.password_digest = bcrypt.hashSync(saveObject.password, 10);
      delete saveObject.password;
      delete saveObject.confirmPassword;
    }

    User.query({
      where: {id: req.currentUser.id}
    }).fetch()
        .then(user => {
          if(user) {
            user.save(saveObject);
            return res.json(Object.assign({}, user.attributes, saveObject));
          } else res.status(500).json({error: 'There is no user with such id'});
        })
        .catch(err => {
          res.status(500).json(err);
        });
  } else res.status(403).json(errors);
});

router.delete('/:id', authenticate, (req, res) => {
  User.query({
    where: { id: req.params.id }
  }).fetch()
    .then(user => {
      res.json(user);
      return user.destroy();
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

router.post('/upload', upload.any(), function(req, res) {
  var file = req.files[Object.keys(req.files)[0]];
  var filename = file.path.split('\\');
  filename = filename[filename.length - 1];
  var dir = `/avatars/${filename}`;
  res.json({image_url: dir});
});

module.exports = router;
