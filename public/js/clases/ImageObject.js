class ImageObject extends GameObject {
    constructor(image, context, width= 50, height = 50, x = 0, y = 0) {
        super(context);
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    start(){}

    update(){}
    
    checkCollision(){}

    draw() {
        if (this.image) {
            this.context.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            throw new Error("No hay imagen para dibujar");
        }
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}
