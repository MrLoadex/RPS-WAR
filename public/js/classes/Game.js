class Game extends EventTarget {
    constructor(lobbyId, mainPlayer, players, context, fps) {
        super();
        this.lobbyId = lobbyId;
        this.mainPlayer = mainPlayer;
        this.players = players;
        this.context = context;
        this.fps = fps;
        this.gameObjects = [];
        this.isPaused = false;
        this.updatedLives = true;
        this.timeToCreateElement = 1000;
        this.canCreateElement = true;
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
        let playerLGO = this.createPlayerGameObject('left');
        this.gameObjects.push(playerLGO);
        let playerRGO = this.createPlayerGameObject('right');
        this.gameObjects.push(playerRGO);
    
    }

    createPlayerGameObject(team) {
        // TODO: Implementar la lógica para crear el objeto del jugador
        const images = {
            threeLives: new Image(),
            twoLives: new Image(),
            oneLife: new Image(),
            zeroLives: new Image()
        };
        // Implementar la lógica para cargar las imágenes
        const assetPrefix = team === 'left' ? 'player_left' : 'player_right';
        images.threeLives.src = `./assets/${assetPrefix}_3.png`;
        images.twoLives.src = `./assets/${assetPrefix}_2.png`;
        images.oneLife.src = `./assets/${assetPrefix}_1.png`;
        images.zeroLives.src = `./assets/${assetPrefix}_0.png`;

        // Implementar la lógica para calcular la posición del jugador
        const x = team === 'left' ? 50 : this.context.canvas.width - 150;
        const y = this.context.canvas.height / 2 - 50;

        return new PlayerGameObject(team, images, this.context, this, 125, 125, x, y);
    }

    createElement(data) {
        switch (data.type) {
            case 'Rock':
                return new Rock(data.team, this.context, 50, 50, this.fps);
            case 'Paper':
                return new Paper(data.team, this.context, 50, 50, this.fps);
            case 'Scissors':
                return new Scissors(data.team, this.context, 50, 50, this.fps);
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
        //esperar 1 segundo antes de crear un nuevo elemento
        if (!this.canCreateElement) return;
        this.canCreateElement = false;
        let element = this.createElement(moveData); // Cambiar createElementFromData a this.createElement
        element.start();
        this.gameObjects.push(element);
        setTimeout(() => {
            this.canCreateElement = true;
        }, this.timeToCreateElement);
    }

    handleElementDestroyed(data) {
        this.gameObjects = this.gameObjects.filter(obj => 
            !(obj.constructor.name === data.type && 
              obj.team === data.team && 
              Math.abs(obj.x - obj.x) < 1 && 
              Math.abs(obj.y - obj.y) < 1)
        );
    }

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
    notifyLifeLoss(team) {
        if (!this.updatedLives) return;
        this.updatedLives = false;
        let player = this.players.find(player => player.team === team);
        player.lives--;
        // Create a TextGameObject to display the message at the top center
        const textObject = new TextGameObject("You lost one life!", context, canvas.width / 2, 60); // 30 pixels from the top
        game.addGameObject(textObject, 1); // Add it to the game with a priority
        const event = new Event('lifeLost');
        this.dispatchEvent(event); // Emitir evento de pérdida de vida
    }
    
    updateLives(players) {
        players.forEach(p => {
            let player = this.players.find(player => player.team === p.team);
            if (player) {
                player.lives = p.lives;
                let playerGO = this.gameObjects.find(obj => obj instanceof PlayerGameObject && obj.team === p.team);
                if (playerGO) {
                    playerGO.changeImage(p.lives);
                }
                // Recorrer gameobjects y destruir los elementos
                this.gameObjects.forEach(obj => {
                    if (obj instanceof ElementGameObject)
                    {
                        obj.destroy();
                    }
                });
                // SIN IMPLEMENTAR AUN
                // actualizar textImageGameObject de las vidas restantes
                // let textImageGameObject = this.gameObjects.find(obj => obj instanceof TextImageGameObject && obj.team === p.team);
                // textImageGameObject.updateText(p.lives);
            }
            this.updatedLives = true; // resetea el flag de updatedLives
        });
        this.verifyGameEnd();
    }

    verifyGameEnd() {
        const losingPlayer = this.players.find(player => player.lives <= 0);
        if (losingPlayer) {
            const winningPlayer = this.players.find(player => player !== losingPlayer);
            console.log(`${winningPlayer.username} wins!`);
            this.endGame(winningPlayer); // Pass the winning player object
        } else if (this.mainPlayer.lives <= 0) {
            console.log("Main player lost");
            const otherPlayer = this.players.find(player => player !== this.mainPlayer);
            this.endGame(otherPlayer); // Pass the other player object
        }
    }

    endGame(winner)
    {
        // Abrir un modal de fin de juego
        this.dispatchEvent(new CustomEvent('gameEnded', { detail: winner.username }));
        this.pause(); // Pausar el juego
    }

    resetGame()
    {
        // Recorrer gameobjects y destruirlos todos menos los jugadores
        this.gameObjects.forEach(obj => {
            //recorrer players y resetear las vidas
            this.players.forEach(player => {
                player.lives = 3;
            });
            if (obj instanceof PlayerGameObject)
            {
                obj.changeImage(3);
            }
            else if (obj instanceof ElementGameObject)
            {
                obj.destroy();
            }
        });
        this.resume(); // Reanudar el juego
    }
            
    pause()
    {
        this.isPaused = true;
    }
    
    resume()
    {
        this.isPaused = false;
    }

    updateCanvasSize(width, height){
        this.context.canvas.width = width;
        this.context.canvas.height = height;
    }
}
