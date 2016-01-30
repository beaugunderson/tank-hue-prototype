'use strict';

var catNames = require('cat-names');
var io = require('socket.io-client');
var Mousetrap = require('mousetrap');
var socket = io();
var Tank = require('./lib/tank.js');
var Pad = require('./lib/pad.js');
var $ = require('jquery');
var _ = require('lodash');

var scale;
var tanks = {};
var pads = [];

_.times(10, function () {
  pads.push(new Pad(_.random(0, 1000), _.random(0, 500)));
});

// TODO: map canvas x/y to game x/y
// TODO: make pads change color
// TODO: add shooting
// TODO: add momentum, speed

function draw() {
  var canvas = document.getElementById('tank-hue');
  var ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ctx.fillStyle = 'yellow';
  // ctx.fillRect(10, 10, 50, 50);

  _.forEach(pads, pad => pad.draw(ctx, scale));
  _.forEach(tanks, tank => tank.draw(ctx, scale));
}

function upscale(canvas, ctx) {
  var devicePixelRatio = window.devicePixelRatio || 1;
  var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                          ctx.mozBackingStorePixelRatio ||
                          ctx.msBackingStorePixelRatio ||
                          ctx.oBackingStorePixelRatio ||
                          ctx.backingStorePixelRatio || 1;

  var ratio = devicePixelRatio / backingStoreRatio;

  // upscale the canvas if the two ratios don't match
  if (devicePixelRatio !== backingStoreRatio) {
    var oldWidth = canvas.width;
    var oldHeight = canvas.height;

    canvas.width = oldWidth * ratio;
    canvas.height = oldHeight * ratio;

    // now scale the context to counter
    // the fact that we've manually scaled
    // our canvas element
    ctx.scale(ratio, ratio);
  }
}

function resize() {
  var canvas = document.getElementById('tank-hue');
  var ctx = canvas.getContext('2d');

  var width = $('#tank-hue').width();
  var height = $('#tank-hue').height();

  canvas.width = width;
  canvas.height = height;

  upscale(canvas, ctx);

  scale = width / 1000;

  draw();
}

$(window).resize(resize);

function setupTank() {
  var tank = new Tank(200, 200);

  function movement(command) {
    return function () {
      command();
      draw();

      socket.emit('move', {player: me, position: tank.position()});

      return false;
    };
  }

  tank.rotate(_.random(0, 360));

  Mousetrap.bind(['up', 'w'], movement(_.bind(tank.forward, tank, scale)));
  Mousetrap.bind(['down', 's'], movement(_.bind(tank.backward, tank, scale)));
  Mousetrap.bind(['left', 'a'], movement(_.bind(tank.rotate, tank, -5)));
  Mousetrap.bind(['right', 'd'], movement(_.bind(tank.rotate, tank, 5)));

  tanks[me.name] = tank;

  draw();
}

$(document).ready(function () {
  resize();

  var canvas = document.getElementById('tank-hue');

  function fullscreen() {
    if (canvas.webkitRequestFullScreen) {
      canvas.webkitRequestFullScreen();
    } else {
      canvas.mozRequestFullScreen();
    }
  }

  canvas.addEventListener('click', fullscreen);
});

var me = {name: catNames.random()};

socket.on('connect', function () {
  socket.emit('join', me);

  setupTank(socket);

  socket.on('move', function (movement) {
    if (!tanks[movement.player.name]) {
      tanks[movement.player.name] = new Tank(movement.position.x,
                                             movement.position.y);
    }

    tanks[movement.player.name].x = movement.position.x;
    tanks[movement.player.name].y = movement.position.y;
    tanks[movement.player.name].heading = movement.position.heading;

    draw();
  });

  socket.on('players', function (players) {
    console.log('players', JSON.stringify(players));
  });

  socket.on('join', function (player) {
    console.log('join', player.name);
  });

  socket.on('leave', function (player) {
    console.log('leave', player.name);
  });

  socket.on('disconnect', function () {
    console.log('disconnect');
  });
});
