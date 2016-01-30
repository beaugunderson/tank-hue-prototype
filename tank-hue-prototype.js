'use strict';

var babelify = require('express-babelify-middleware');
var express = require('express');
var http = require('http');
var IO = require('socket.io');
var swig = require('swig');
var _ = require('lodash');

var app = express();
var server = http.Server(app);
var io = IO(server);

app.engine('html', swig.renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/client');

app.set('view cache', false);
swig.setDefaults({cache: false});

app.use('/css', express.static(__dirname + '/client/css'));

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/js/tank-hue.js', babelify(__dirname + '/client/js/tank-hue.js'));

var players = {};

io.on('connection', function (socket) {
  players[socket.id] = {};

  socket.on('move', function (movement) {
    socket.broadcast.emit('move', movement);
  });

  socket.on('join', function (player) {
    players[socket.id].name = player.name;

    socket.broadcast.emit('join', player);

    socket.emit('players', _.values(players));
  });

  socket.on('disconnect', function () {
    socket.broadcast.emit('leave', players[socket.id]);

    if (players[socket.id]) {
      delete players[socket.id];
    }

    socket.broadcast.emit('players', _.values(players));
  });
});

server.listen(process.env.PORT);
