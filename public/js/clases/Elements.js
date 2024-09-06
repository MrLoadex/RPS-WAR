class Element {
  constructor(x, y, radius, color, context) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.alpha = 1;
    this.context = context;
    this.team; // Left or right
  }

  draw() {
    // Método virtual, esperado ser sobrescrito por las subclases
    throw new Error("draw() debe ser implementado por las subclases");
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }

  move(){
    // Mover horizontalmente dependiendo el equipo [L --> | R <--]
  }
}

class Paper extends Element {
  constructor(x, y, size, color) {
    super(x, y, size, color);
  }

  draw() {
    context.fillStyle = this.color;
    context.fillRect(this.x - 50, this.y - 50, 100, 100);
  }
}

class Rock extends Element {
  constructor(x, y, radius, color) {
    super(x, y, radius, color);
  }

  draw() {
    context.beginPath();
    context.arc(this.x, this.y, 50, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.fill();
  }
}

class Scissors extends Element {
  constructor(x, y, size, color) {
    super(x, y, size, color);
  }

  draw() {
    context.beginPath();
    context.moveTo(this.x, this.y - 50);
    context.lineTo(this.x - 50, this.y + 50);
    context.lineTo(this.x + 50, this.y + 50);
    context.closePath();
    context.fillStyle = this.color;
    context.fill();
}
}
