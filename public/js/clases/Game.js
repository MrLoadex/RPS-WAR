class Game {
    constructor(lobbyId, players, context) {
        this.lobbyId = lobbyId;
        this.players = players;
        this.context = context;
        this.gameObjects = [];
        this.isPaused = false;
    }

    start() {
        const playerLeft = this.players.find(player => player.team === 'left');
        const playerRight = this.players.find(player => player.team === 'right');
        if (!playerLeft || !playerRight) {
            throw new Error("No se encontraron jugadores para ambos equipos.");
        }
        
        let playerLGO = this.crearPlayerGameObject('left');
        this.gameObjects.push(playerLGO);
        let playerRGO = this.crearPlayerGameObject('right');
        this.gameObjects.push(playerRGO);
    
    }

    crearPlayerGameObject(team) {
        const imagenes = {
            threeLives: new Image(),
            twoLives: new Image(),
            oneLife: new Image(),
            zeroLives: new Image()
        };

        const assetPrefix = team === 'left' ? 'player_left' : 'player_right';
        imagenes.threeLives.src = `./assets/${assetPrefix}_3.png`;
        imagenes.twoLives.src = `./assets/${assetPrefix}_2.png`;
        imagenes.oneLife.src = `./assets/${assetPrefix}_1.png`;
        imagenes.zeroLives.src = `./assets/${assetPrefix}_0.png`;

        const x = team === 'left' ? 50 : this.context.canvas.width - 150;
        const y = this.context.canvas.height / 2 - 50;

        return new PlayerGameObject(team, imagenes, this.context, this, 100, 100, x, y);
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
    // jugador pierde vida 
    
    pause()
    {
        this.isPaused = true;
    }
    
    resume()
    {
        this.isPaused = false;
    }
}