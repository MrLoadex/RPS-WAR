class ElementGameObject extends GifGameObject {
  constructor(team, context, height = 50, width = 50, images = [], fps = 30) {
    super(images[0], context, width, height, 0, 0, images, fps);
    this.team = team;
    this.speed = 2; // Velocidad de movimiento
    this.setInitialPosition();
    this.isDestroyed = false;
  }

  start() {
    this.setImages();
    super.start();
  }

  setImages() {
    throw new Error("El método 'setImages' debe ser implementado por las clases hijas.");
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

class Paper extends ElementGameObject {
  constructor(team, context, height = 50, width = 50, images = [], fps = 30) {
    super(team, context, height, width, images, fps);
  }

  setImages() {
    let images = [
      new Image(),
      new Image(),
      new Image(),
      new Image(),
      new Image()
    ];

    
    images.forEach((image, index) => {
      if (this.team === 'right') {
        image.src = `./assets/Elements/Paper/Paper_R_${index}.png`;
      }
      else {
        image.src = `./assets/Elements/Paper/Paper_L_${index}.png`;
      }
    });

    this.images = images;
    this.image = images[0];
  }
}

class Rock extends ElementGameObject {
  constructor(team, context, height = 50, width = 50, images = [], fps = 30) {
    super(team, context, height, width, images, fps);
  }

  setImages() {
    let images = [
      new Image(),
      new Image(),
      new Image(),
      new Image(),
      new Image()
    ];
  
    // Implementar la lógica para cargar las imágenes
    //Esto deberia estar dentro de cada elemento, pero solo es testeo
    images.forEach((image, index) => {
      if (this.team === 'right') {
        image.src = `./assets/Elements/Rock/Rock_R_${index}.png`;
      }
      else {
        image.src = `./assets/Elements/Rock/Rock_L_${index}.png`;
      }
    });

    this.images = images;
    this.image = images[0];
  }
}

class Scissors extends ElementGameObject {
  constructor(team, context, height = 50, width = 50, images = [], fps = 30) {
    super(team, context, height, width, images, fps);
  }

  setImages() {
    let images = [
      new Image(),
      new Image(),
      new Image(),
      new Image(),
      new Image(),
    ];
  
    // Implementar la lógica para cargar las imágenes
    //Esto deberia estar dentro de cada elemento, pero solo es testeo
    images.forEach((image, index) => {
        if (this.team === 'right') {
        image.src = `./assets/Elements/Scissors/Scissors_R_${index}.png`;
      }
      else {
        image.src = `./assets/Elements/Scissors/Scissors_L_${index}.png`;
      }
    });

    this.images = images;
    this.image = images[0];
  }
}