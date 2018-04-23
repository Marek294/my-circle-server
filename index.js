'use strict';

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const routes = require('./routes');


// Setup server
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
routes(app);

app.set('port', (process.env.PORT || 5000));

io.on('connection', function(socket) {
  console.log('Connection was made ' + socket.id);
  socket.on('ADD_POST', function(data) {
    // console.log(data);
    socket.broadcast.emit(`SERVER_NEW_POST:${data.circle_id}`, data);
  });
});

// Start server
server.listen(app.get('port'), () => console.log(`Running on port: ${app.get('port')}`));

// Expose app
exports = module.exports = app;
