'use strict';

var Entity = require('./entity.js');
var _ = require('lodash');

class Pad extends Entity {
  constructor(x, y) {
    super(x, y);

    this.color = _.sample(['blue', 'red', 'yellow', 'green', 'purple']);
  }

  draw(ctx, scale) {
    ctx.save();

    ctx.translate(this.x * scale, this.y * scale);

    ctx.fillStyle = this.color;

    ctx.beginPath();
    ctx.arc(0, 0, 20 * scale, 0, Math.PI * 2);
    ctx.closePath();

    ctx.fill();

    ctx.restore();
  }
}

module.exports = Pad;
