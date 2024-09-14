class Element{
  constructor(x, y, radius, color, context, team) {
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
  constructor(x, y, size, color, team) {
    super(x, y, size, color, team);
  }

  draw() {
    context.beginPath();
    context.fillStyle = this.color;
    if (this.team == "left") {
      //Si es el equipo izquierdo, dibujar en el lado izquierdo
      context.fillRect(this.x - 50, this.y - 50, 100, 100);
    }
    else {
      //Si es el equipo derecho, dibujar en el lado derecho
      context.fillRect(this.x + 50, this.y - 50, 100, 100);
    }
  }
}

class Rock extends Element {
  constructor(x, y, radius, color, team) {
    super(x, y, radius, color, team);
  }

  draw() {
    context.beginPath();
    //Si es el equipo izquierdo, dibujar en el lado izquierdo
    if (this.team == "left") {
      context.arc(this.x - 50, this.y, 50, 0, Math.PI * 2);
    }
    else {
      //Si es el equipo derecho, dibujar en el lado derecho
      context.arc(this.x + 50, this.y, 50, 0, Math.PI * 2);
    }
  }
}

class Scissors extends Element {
  constructor(x, y, size, color, team) {
    super(x, y, size, color, team);
  }

  draw() {
    //Si es el equipo izquierdo, dibujar en el lado izquierdo
    if (this.team == "left") {
      context.moveTo(this.x, this.y - 50);
      context.lineTo(this.x - 50, this.y + 50);
      context.lineTo(this.x + 50, this.y + 50);
      context.closePath();
    }
    else {
      //Si es el equipo derecho, dibujar en el lado derecho
      context.moveTo(this.x, this.y - 50);
      context.lineTo(this.x - 50, this.y + 50);
      context.lineTo(this.x + 50, this.y + 50);
      context.closePath();
    }
  }
}
