/**
 * Main application routes
 */

'use strict';

const errors = require('./components/errors');
const path = require('path');

const users = require('./api/users');
const circles = require('./api/circles');
const posts = require('./api/posts');
const commentaries = require ('./api/commentaries');
const auth = require('./api/auth');
// import adminAuth from './api/admin/auth';
const admins = require('./api/admin/admins');

module.exports = app => {
  // Insert routes below
  app.use('/api/users', users);
  app.use('/api/circles', circles);
  app.use('/api/posts', posts);
  app.use('/api/commentaries', commentaries);
  app.use('/api/authenticate', auth);
  app.use('/api/admins', admins);
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

}
