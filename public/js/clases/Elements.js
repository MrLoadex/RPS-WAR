class Element {
  constructor(size, color, team, context) {
    this.size = size;
    this.color = color;
    this.team = team;
    this.context = context;
    this.velocity = { x: 0, y: 0 };
    this.friction = 0.98;
    this.alpha = 1;
    this.setInitialPosition();
  }

  setInitialPosition() {
    const canvasWidth = this.context.canvas.width;
    const canvasHeight = this.context.canvas.height;
    this.y = canvasHeight / 2;
    if (this.team === 'left') {
      this.x = canvasWidth * 0.25;
    } else {
      this.x = canvasWidth * 0.75;
    }
  }

  draw() {
    // Método virtual, esperado ser sobrescrito por las subclases
    throw new Error("draw() debe ser implementado por las subclases");
  }

  update() {
    this.draw();
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01;
  }

  getDrawPosition() {
    return { x: this.x, y: this.y };
  }
}

class Paper extends Element {
  draw() {
    const { x, y } = this.getDrawPosition();
    this.context.fillStyle = this.color;
    this.context.fillRect(x - this.size / 2, y - this.size / 2, this.size, this.size);
  }
}

class Rock extends Element {
  draw() {
    const { x, y } = this.getDrawPosition();
    this.context.beginPath();
    this.context.arc(x, y, this.size / 2, 0, Math.PI * 2);
    this.context.fillStyle = this.color;
    this.context.fill();
  }
}

class Scissors extends Element {
  draw() {
    const { x, y } = this.getDrawPosition();
    this.context.beginPath();
    this.context.moveTo(x, y - this.size / 2);
    this.context.lineTo(x - this.size / 2, y + this.size / 2);
    this.context.lineTo(x + this.size / 2, y + this.size / 2);
    this.context.closePath();
    this.context.fillStyle = this.color;
    this.context.fill();
  }
}
