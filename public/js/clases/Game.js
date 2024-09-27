class Game {
    constructor(lobbyId, players, context) {
        this.lobbyId = lobbyId;
        this.players = players;
        this.context = context;
        this.gameObjects = [];
        this.isPaused = false;
    }

    start() {
    }

    createElement(data) {
        switch (data.type) {
            case 'Rock':
                return new Rock(data.team, this.context);
            case 'Paper':
                return new Paper(data.team, this.context);
            case 'Scissors':
                return new Scissors(data.team, this.context);
            default:
                return null;
        }
    }

    update() {
        //Pause
        if (this.isPaused)
        {
            return;
        }
        // Dibujar todos los objetos
        this.gameObjects.forEach(obj => obj.draw());
        // Actualizar y dibujar todos los objetos del juego
        this.gameObjects.forEach(obj => obj.update());

        // Verificar colisiones
        for (let i = 0; i < this.gameObjects.length; i++) {
            for (let j = i + 1; j < this.gameObjects.length; j++) {
                if (this.gameObjects[i].checkCollision(this.gameObjects[j])) {
                    this.gameObjects[i].handleCollision(this.gameObjects[j]);
                }
            }
        }

        // Eliminar objetos destruidos
        this.gameObjects = this.gameObjects.filter(obj => !obj.isDestroyed);
    }

    addMove(moveData) {
        let element = this.createElement(moveData); // Cambiar createElementFromData a this.createElement
        this.gameObjects.push(element);
    }

    handleElementDestroyed(data) {
        this.gameObjects = this.gameObjects.filter(obj => 
            !(obj.constructor.name === data.type && 
              obj.team === data.team && 
              Math.abs(obj.x - obj.x) < 1 && 
              Math.abs(obj.y - obj.y) < 1)
        );
    }

    //
    addGameObject(gameObject, priority)
    {
        if (priority === 0)
        {
            this.gameObjects.unshift(gameObject);
        }
        else
        {
        this.gameObjects.push(gameObject);
        }
    }

    pause()
    {
        this.isPaused = true;
    }
    
    resume()
    {
        this.isPaused = false;
    }
}