class TextGameObject extends GameObject {
    constructor(text, context, x, y, fontSize = 40, color = 'gray', autoDestroy = true) {
        super(context);
        this.text = text;
        this.x = x;
        this.y = y;
        this.fontSize = fontSize;
        this.color = color;
        this.lifetime = 2000; // Duration to display the text in milliseconds
        this.startTime = Date.now(); // Track when the text was created
        this.autoDestroy = autoDestroy;
    }

    update() {
        // Hide the text after its lifetime
        if (Date.now() - this.startTime > this.lifetime) {
            if (this.autoDestroy) {
                this.destroy(); 
            }
        }
    }
    draw() {
        this.context.shadowColor = 'black';
        this.context.shadowBlur = 10;
        this.context.shadowOffsetX = 2;
        this.context.shadowOffsetY = 2;
        this.context.font = `bold ${this.fontSize}px 'Press Start 2P', sans-serif`;
        this.context.fillStyle = this.color;
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 2;
        this.context.textAlign = 'center';
        this.context.strokeText(this.text, this.x, this.y);
        this.context.fillText(this.text, this.x, this.y);

        this.context.strokeStyle = 'none';
        this.context.shadowColor = 'transparent';
    }

    checkCollision() {
        // No collision detection needed for text objects
        return false;
    }
}
