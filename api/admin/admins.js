'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const adminAuthenticate = require('../../middlewares/adminAuthenticate');

const signupValidations = require('../../validations/signup');

const updateValidations = require('../../validations/update');

const User = require('../../models/user');

const router = express.Router();

router.get('/', adminAuthenticate, (req, res) => {
  User.fetchAll().then((users) => {
    res.json({ success: true, users });
  });
});

router.get('/:id', adminAuthenticate, (req, res) => {
  User.query({
    where: { id: req.params.id },
  }).fetch()
  .then(user => {
    res.json({ success: true, user });
  });
});

router.post('/', (req, res) => {
  let { errors, isValid } = signupValidations(req.body);
  if(isValid) {
    const { username, email, password } = req.body;
    const password_digest = bcrypt.hashSync(password, 10);

    User.forge({ username, email, password_digest, role: 'admin' }, { hasTimestamps: true }).save()
      .then(user => {
        res.json({ success: true, user });
      })
      .catch(err => {
        res.status(500).json({ success: false, errors: err });
      });
  } else res.status(403).json({ success: false, errors });
});

router.put('/', adminAuthenticate, (req, res) => {
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
          res.json({success: true, user: Object.assign({}, user.attributes, saveObject)});
        } else res.status(500).json({success: true, errors: 'There is no user with such id'});
      })
      .catch(err => {
        res.status(500).json({success: false, errors: err});
      });
  } else res.status(403).json({ success: false, errors });
});

router.delete('/', adminAuthenticate, (req, res) => {
  User.query({
    where: { id: req.currentUser.id }
  }).fetch()
    .then(user => {
      res.json({ success: true, user });
      user.destroy();
    })
    .catch(err => {
      res.status(500).json({ success: false, errors: err });
    });
});

module.exports = router;
