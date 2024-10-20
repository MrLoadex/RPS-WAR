class GifGameObject extends ImageGameObject {
    constructor(actualImage, context, width= 50, height = 50, x = 0, y = 0, images = [], fps = 30) {
        super(actualImage, context, width, height, x, y);
        this.images = images;
        this.actualImageCount = 0;
        this.fps = fps;
        this.changeImageRatio = Math.floor(fps / images.length);
        this.actualFps = 0;
    }


    start() {
        super.start();
        this.changeImageRatio = Math.floor(this.fps / this.images.length);
    }

    update() {
        super.update();
    }

    draw() {
        this.calculateChangeImage();
        super.draw();
    }

    setActualImage(actualImage) {
        this.image = actualImage;
    }

    calculateChangeImage() {
        this.actualFps = (this.actualFps + 1) % this.fps;
        if (this.actualFps % this.changeImageRatio === 0) {
            this.actualImageCount++;
            if (this.actualImageCount >= this.images.length) this.actualImageCount = 0;
            this.setActualImage(this.images[this.actualImageCount]);
        }
    }
}
