class Game {
    constructor(lobbyId, players, context) {
        this.lobbyId = lobbyId;
        this.players = players;
        this.context = context;
        this.gameObjects = [];
        this.isPaused = false;
        this.updatedLives = true;
    }

    start() {
        // Comprobar que hay un jugador en cada equipo
        let playerLeft = this.players.find(player => player.team === 'left');
        let playerRight = this.players.find(player => player.team === 'right');
        if (!playerLeft || !playerRight) {
            throw new Error("Players for both teams were not found.");
        }
        // Setear las vidas de los jugadores
        playerLeft.lives = 3;
        playerRight.lives = 3;
        // Crear los objetos de los jugadores
        let playerLGO = this.crearPlayerGameObject('left');
        this.gameObjects.push(playerLGO);
        let playerRGO = this.crearPlayerGameObject('right');
        this.gameObjects.push(playerRGO);
    
    }

    crearPlayerGameObject(team) {
        // TODO: Implementar la lógica para crear el objeto del jugador
        const imagenes = {
            threeLives: new Image(),
            twoLives: new Image(),
            oneLife: new Image(),
            zeroLives: new Image()
        };
        // Implementar la lógica para cargar las imágenes
        const assetPrefix = team === 'left' ? 'player_left' : 'player_right';
        imagenes.threeLives.src = `./assets/${assetPrefix}_3.png`;
        imagenes.twoLives.src = `./assets/${assetPrefix}_2.png`;
        imagenes.oneLife.src = `./assets/${assetPrefix}_1.png`;
        imagenes.zeroLives.src = `./assets/${assetPrefix}_0.png`;

        // Implementar la lógica para calcular la posición del jugador
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
    notifyLifeLoss(team)
    {
        if (!this.updatedLives){return;}
        this.updatedLives = false;
        let player = this.players.find(player => player.team === team);
        player.lives--;
    }
    
    updateLives(players){
        players.forEach(p => {
            let player = this.players.find(player => player.team === p.team);
            if(player){
                player.lives = p.lives;
                let playerGO = this.gameObjects.find(obj => obj instanceof PlayerGameObject && obj.team === p.team);
                if(playerGO){
                    playerGO.changeImage(p.lives);
                }
                // SIN IMPLEMENTAR AUN
                // actualizar textImageGameObject de las vidas restantes
                // let textImageGameObject = this.gameObjects.find(obj => obj instanceof TextImageGameObject && obj.team === p.team);
                // textImageGameObject.updateText(p.lives);
            }
            this.updatedLives = true; // resetea el flag de updatedLives
        });
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