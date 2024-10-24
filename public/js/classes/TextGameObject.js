class TextGameObject extends GameObject {
    constructor(text, context, x, y, fontSize = 40, color = 'red') {
        super(context);
        this.text = text;
        this.x = x;
        this.y = y;
        this.fontSize = fontSize;
        this.color = color;
        this.isVisible = true; // To control visibility
        this.lifetime = 2000; // Duration to display the text in milliseconds
        this.startTime = Date.now(); // Track when the text was created
    }

    update() {
        // Hide the text after its lifetime
        if (Date.now() - this.startTime > this.lifetime) {
            this.isVisible = false;
            // console.log("Text is now invisible"); // Debug log
    }
}

    draw() {
        if (this.isVisible) {
            this.context.font = `${this.fontSize}px Arial`;
            this.context.fillStyle = this.color;
            this.context.fillText(this.text, this.x, this.y);
        }
    }

    checkCollision() {
        // No collision detection needed for text objects
        return false;
    }
}
