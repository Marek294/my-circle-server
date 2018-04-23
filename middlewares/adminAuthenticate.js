'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');

const User = require('../models/user');

module.exports = (req, res, next) => {
  const authorizationHeader = req.headers['adminauthorizationtoken'];
  let token;

  if(authorizationHeader) token = authorizationHeader.split(' ')[1];

  if(token) {
    jwt.verify(token, config.jwtSecret, (err, decoded) => {
      if(err) {
        res.status(401).json({ error: 'Failed to authenticate' });
      } else {
        User.query({
          select: ['id', 'username', 'email'],
          where: { id: decoded.id }
        }).fetch()
        .then(admin => {
          if(admin) {
            req.currentAdmin = admin;
            next();
            return;
          } else {
            res.status(404).json({ error: 'No such admin' });
          }
        });
      }
    });
  } else {
    res.status(403).json({ error: 'No token provided' });
  }
};
