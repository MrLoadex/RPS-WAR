class Element extends GameObject {
  constructor(team, context) {
    super(context);
    this.size;
    this.color;
    this.team = team;
    this.speed = 2; // Velocidad de movimiento
    this.setInitialPosition();
    this.isDestroyed = false;
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

  move() {
    if (this.team === 'left') {
      this.x += this.speed;
    } else {
      this.x -= this.speed;
    }
  }

  update() {
    this.move(); // Llamamos a move() en cada update
  }

  getDrawPosition() {
    return { x: this.x, y: this.y };
  }

  checkCollision(otherElement) {
    if (this.isDestroyed || otherElement.isDestroyed) return false;
    const distance = Math.sqrt(
      Math.pow(this.x - otherElement.x, 2) + Math.pow(this.y - otherElement.y, 2)
    );
    return distance < (this.size + otherElement.size) / 2;
  }

  handleCollision(otherElement) {
    if (this.constructor === otherElement.constructor) {
      this.destroy();
      otherElement.destroy();
    } else if (
      (this instanceof Rock && otherElement instanceof Scissors) ||
      (this instanceof Paper && otherElement instanceof Rock) ||
      (this instanceof Scissors && otherElement instanceof Paper)
    ) {
      otherElement.destroy();
    } else {
      this.destroy();
    }
  }

  destroy() {
    this.isDestroyed = true;
    // Emitir evento de destrucción
    if (typeof socket !== 'undefined') {
      socket.emit('elementDestroyed', {
        type: this.constructor.name,
        team: this.team,
        x: this.x,
        y: this.y
      });
    }
  }
}

class Paper extends Element {
  constructor(team, context) {
    super(team, context);
    this.size = 50; // Tamaño específico para Paper
    this.color = 'blue'; // Color específico para Paper
  }

  draw() {
    const { x, y } = this.getDrawPosition();
    this.context.fillStyle = this.color;
    this.context.fillRect(x - this.size / 2, y - this.size / 2, this.size, this.size);
  }
}

class Rock extends Element {
  constructor(team, context) {
    super(team, context);
    this.size = 50; // Tamaño específico para Rock
    this.color = 'gray'; // Color específico para Rock
  }

  draw() {
    const { x, y } = this.getDrawPosition();
    this.context.beginPath();
    this.context.arc(x, y, this.size / 2, 0, Math.PI * 2);
    this.context.fillStyle = this.color;
    this.context.fill();
  }
}

class Scissors extends Element {
  constructor(team, context) {
    super(team, context);
    this.size = 50; // Tamaño específico para Scissors
    this.color = 'red'; // Color específico para Scissors
  }

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