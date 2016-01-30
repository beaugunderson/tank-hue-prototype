'use strict';

var Entity = require('./entity.js');
var _ = require('lodash');

function radians(angle) {
  return Math.PI * angle / 180;
}

class Tank extends Entity {
  constructor(x, y) {
    super(x, y);

    this.width = 15;
    this.height = 24;

    this.color = _.sample(['blue', 'red', 'yellow', 'green', 'purple']);

    this.heading = 180;
  }

  position() {
    return {
      heading: this.heading,
      x: this.x,
      y: this.y
    };
  }

  rotate(angle) {
    this.heading += angle;
  }

  forward(scale) {
    var rad = radians(-this.heading);

    this.x += 6 * scale * Math.sin(rad);
    this.y += 6 * scale * Math.cos(rad);
  }

  backward(scale) {
    var rad = radians(-this.heading);

    this.x -= 6 * scale * Math.sin(rad);
    this.y -= 6 * scale * Math.cos(rad);
  }

  draw(ctx, scale) {
    ctx.save();

    ctx.translate(this.x * scale, this.y * scale);
    ctx.rotate(radians(this.heading));

    ctx.fillStyle = this.color;

    ctx.fillRect(-this.width / 2 * scale,
                 -this.height / 2 * scale,
                 this.width * scale,
                 this.height * scale);

    ctx.fillStyle = 'black';

    ctx.fillRect(-this.width * 0.05 * scale,
                 0,
                 this.width * 0.05 * 2 * scale,
                 this.height * 0.75 * scale);

    ctx.restore();
  }
}

module.exports = Tank;
