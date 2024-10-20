const socket = io();

const urlParams = new URLSearchParams(window.location.search);
const player = new Player();
player.username = urlParams.get('username');
const lobbyId = urlParams.get('lobbyId');

// Iniciar el bucle de actualización a aproximadamente 30 FPS
const FPS = 30;

// REGION DE INICIALIZACION
// Crear una instancia de Player
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const game = new Game(player.currentLobbyId, player, [player], context, FPS);

// Obtener el modal de fin de juego
var gameLobbyModal = document.getElementById("gameLobbyModal");
var gameLobbyModalContent = document.getElementById("gameLobbyModalContent");


// Obtener el botón que abre el modal de fin de juego
var btn = document.getElementById("gameLobbyModalBtn");

// Obtener el elemento <span> que cierra el modal
var span = document.getElementsByClassName("close")[0];

// Cuando el usuario hace clic en el botón, abrir el modal
btn.onclick = function() {
  gameLobbyModal.style.display = "block";
}

// Cuando el usuario hace clic en <span> (x), cerrar el modal
span.onclick = function() {
  gameLobbyModal.style.display = "none";
}

// Cuando el usuario hace clic en cualquier lugar fuera del modal, cerrarlo
window.onclick = function(event) {
  if (event.target == gameLobbyModal) {
    gameLobbyModal.style.display = "none";
  }
}

// REGION DE EVENTOS INTERNOS DEL JUEGO
game.addEventListener('lifeLost', () => {
    updateLives();
});

game.addEventListener('gameEnded', (e) => {
    const winner = e.detail;
    if (winner) {
        displayMessage(`El juego ha terminado. Has ganado.`, "gameEndModalContent");
    } else {
        displayMessage(`El juego ha terminado. Has perdido.`, "gameEndModalContent");
    }
    gameEndedModal.style.display = 'block';
});

// REGION DE EVENTOS EXTERNOS DEL JUEGO
socket.on('loginSuccess', (data) => {
    player.userID = data.userId;
    player.username = data.username;
});

socket.on('lobbyCreated', (data) => {
    // Avisarle al jugador
    player.currentLobbyId = data.lobbyId;
    player.team = data.team;
    displayMessage(`Lobby creado con ID: ${player.currentLobbyId}.`, "gameLobbyModalContent");
});

socket.on('playerJoined', (data) => {
    //Unir al player al lobby
    player.currentLobbyId = data.lobbyId;
    displayMessage(`Te has unido al lobby: ${player.currentLobbyId}`, "gameLobbyModalContent");
    data.players.forEach(p => {
        if (p.username === player.username) {
            player.team = p.team;
        }
    });
});

socket.on('startGame', (data) => {
    let backgroundImage = new Image();
    backgroundImage.src = './assets/background.png';
    // Ajustar el ancho y la altura para que ocupen todo el canvas
    width = context.canvas.width;
    height = context.canvas.height;
    let background = new ImageGameObject(backgroundImage, context, width, height );
    game.addGameObject(background, 0);
    game.players = data.players;
    game.mainPlayer = player;
    game.start(); // Iniciar el juego
});

socket.on('playerMove', (moveData) => {
    game.addMove(moveData); // Agregar el movimiento al juego
});

socket.on('lobbyError', (data) => {
    displayMessage(`Error: ${data.message}`, "gameLobbyModalContent");
});

socket.on('playerDisconnected', (data) => {
    displayMessage(`Lobby: ${player.currentLobbyId} - Jugador ${data.playerId} se ha desconectado.`, "gameLobbyModalContent");
});

socket.on('elementDestroyed', (data) => {
    // Encontrar y eliminar el elemento destruido de gameObjects
    game.gameObjects = game.gameObjects.filter(obj => 
        !(obj.constructor.name === data.type && 
          obj.team === data.team && 
          Math.abs(obj.x - data.x) < 1 && 
          Math.abs(obj.y - data.y) < 1)
    );
});

socket.on('gamePaused', (isPaused) => {
    if (isPaused) {
        console.log("Game paused!");
        document.getElementById('gamePausedModal').style.display = 'block';
        game.pause();
    } else {
        console.log("Game resumed!");
        game.resume();
        document.getElementById('gamePausedModal').style.display = 'none';
    }
});

socket.on('playerLostLife', (players) => {

    for (let i = 0; i < players.length; i++) {
        if (player.username === players[i].username) {
            player.lives = players[i].lives;
            game.updateLives(players);
            break;
        }
    }
});

socket.on('resetGame', () => {
    gameEndedModal.style.display = "none";
    game.resetGame();
});

// REGION DE FUNCIONES
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        socket.emit('gamePaused', true);
    } else {
        socket.emit('gamePaused', false);
    }
});

function login() {
    player.login(player.username);
}

function createLobby() {
    socket.emit('createLobby');
}

function joinLobby() {
    socket.emit('joinLobby', lobbyId);
}

function sendMove(strElement) {
    player.sendMove(strElement);
}

function displayMessage(message, modal) {
    const modalContent = document.getElementById(modal);
    modalContent.textContent = message;
    modalContent.textContent += "\n";
}

function update() {
    // Limpiar el canvas
    context.clearRect(0, 0, canvas.width, canvas.height); 
    game.update(); // Delegar la actualización a la instancia de Game
}

function updateLives(){
    let players = game.players;
    // Solo emitira el evento el player right (para evitar que el evento se repita)
    if (player.team ==='right'){
        socket.emit("playerLostLife", players);
    }
}

// Función para crear un elemento a partir de los datos recibidos
function createElementFromData(data) {
    return game.createElement(data);
}

function resetGame() {
    socket.emit('resetGame');
}

// REGION DE INICIALIZACION 2
socket.emit('login', player.username);
if (lobbyId) {
    joinLobby();
} else {
    createLobby();
}


setInterval(update, 1000 / FPS);
