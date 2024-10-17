class PlayerGameObject extends ImageObject {
    constructor(team,images, context, gameInstance ,width= 50, height = 50, x = 0, y = 0) {
        super(images.threeLives, context, width, height, x, y);
        this.team = team;
        this.images = images;
        this.gameInstance = gameInstance;
    }
    changeImage(actualLives){
        switch(actualLives){
            case 3:
                this.image = this.images.threeLives;
                break;
            case 2:
                this.image = this.images.twoLives;
                break;
            case 1:
                this.image = this.images.oneLife;
                break;
            case 0:
                this.image = this.images.zeroLives; 
                break;
        }
    }
    start(){}
    update(){}
    checkCollision(otherGameObject) {
        if (otherGameObject.isDestroyed) return false;
        const distanciaX = Math.abs(this.x - otherGameObject.x);
        return distanciaX < (this.width + otherGameObject.size) / 2;
    }
    handleCollision(otherElement){
        if(!otherElement instanceof Element){
            return;
        }
       
        if(this.team === otherElement.team){
            return;
        }

        if (!this.gameInstance.updatedLives){
            return;
        }

        this.gameInstance.notifyLifeLoss(this.team);
        otherElement.destroy(); // Destruir el elemento para evitar contacto continuo y no perder mas vidas
    }
}
