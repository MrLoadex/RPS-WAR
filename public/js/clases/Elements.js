class Element extends GifGameObject {
  constructor(team, context, height = 50, width = 50, images = [], fps = 30) {
    super(images[0], context, width, height, 0, 0, images, fps);
    this.team = team;
    this.speed = 2; // Velocidad de movimiento
    this.setInitialPosition();
    this.isDestroyed = false;
  }

  start() {
    super.start();
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
    const distance = Math.abs(this.x - otherElement.x);
    return distance < (this.width + otherElement.width) / 2;
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
  constructor(team, context, height = 50, width = 50, images = [], fps = 30) {
    super(team, context, height, width, images, fps);
  }

  handleCollision(otherElement) {
    if (otherElement instanceof Rock) {
      otherElement.destroy();
    } else if (otherElement instanceof Scissors) {
      this.destroy();
    }
    else if (otherElement instanceof Paper) {
      //si el otro no esta destruido, destruimos el otro
      if (!otherElement.isDestroyed) {
        otherElement.destroy();
      }
      //si el otro esta destruido, destruimos nosotros
      if (!this.isDestroyed) {
        this.destroy();
      }
    }
  }
}

class Rock extends Element {
  constructor(team, context, height = 50, width = 50, images = [], fps = 30) {
    super(team, context, height, width, images, fps);
  }

  handleCollision(otherElement) {
    if (otherElement instanceof Scissors) {
      otherElement.destroy();
    } else if (otherElement instanceof Paper) {
      this.destroy();
    }
    else if (otherElement instanceof Rock) {
      //si el otro no esta destruido, destruimos el otro
      if (!otherElement.isDestroyed) {
        otherElement.destroy();
      }
      //si el otro esta destruido, destruimos nosotros
      if (!this.isDestroyed) {
        this.destroy();
      }
    }
  }
}

class Scissors extends Element {
  constructor(team, context, height = 50, width = 50, images = [], fps = 30) {
    super(team, context, height, width, images, fps);
  }

  handleCollision(otherElement) {
    if (otherElement instanceof Paper) {
      otherElement.destroy();
    } else if (otherElement instanceof Rock) {
      this.destroy();
    }
    else if (otherElement instanceof Scissors) {
      //si el otro no esta destruido, destruimos el otro
      if (!otherElement.isDestroyed) {
        otherElement.destroy();
      }
      //si el otro esta destruido, destruimos nosotros
      if (!this.isDestroyed) {
        this.destroy();
      }
    }
  }
}