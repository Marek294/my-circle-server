const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

const User = require('../models/user');

const router = express.Router();

router.post('/', (req, res) => {
  const { usernameOrEmail, password } = req.body;

  User.query({
    where: { username: usernameOrEmail },
    orWhere: { email: usernameOrEmail }
  }).fetch().then(user => {
    if(user) {
      if(bcrypt.compareSync(password,user.get('password_digest'))) {

        const token = jwt.sign({
          id: user.get('id'),
          username: user.get('username'),
          role: user.get('role')
        }, config.jwtSecret);

        res.json({token: token});

      } else res.status(403).json({errors: { form: 'Invalid authentication' } });
    } else res.status(403).json({errors: { form: 'Invalid authentication' } });
  })

});

module.exports = router;
