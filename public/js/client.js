const socket = io();

// Crear una instancia de Player
const player = new Player();
player.username = new URLSearchParams(window.location.search).get('username'); // Asignar el nombre de usuario al jugador
// Variables globales
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const game = new Game(player.currentLobbyId, [player], context);

socket.on('loginSuccess', (data) => {
    player.userID = data.userId;
    player.username = data.username;
    displayMessage(`Bienvenido, ${player.username}!`);
});

socket.on('lobbyCreated', (data) => {
    // Avisarle al jugador
    player.currentLobbyId = data.lobbyId;
    player.team = data.team;
    displayMessage(`Lobby creado con ID: ${player.currentLobbyId}. Eres el equipo ${player.team}`);
});

socket.on('playerJoined', (data) => {
    //Unir al player al lobby
    player.currentLobbyId = data.lobbyId;
    displayMessage(`Te has unido al lobby: ${player.currentLobbyId}`);
    data.players.forEach(p => {
        displayMessage(`Jugador: ${p.username}, Equipo: ${p.team}`);
        if (p.username === player.username) {
            player.team = p.team;
        }
    });
});

socket.on('startGame', (data) => {
    displayMessage(`¡El juego ha comenzado en el lobby ${data.lobbyId}!`);
    data.players.forEach(p => {
        displayMessage(`Jugador: ${p.username}, Equipo: ${p.team}`);
    });
    game.start(); // Iniciar el juego
});

socket.on('playerMove', (moveData) => {
    displayMessage(`Jugador ${moveData.username} (${moveData.team}) hizo un movimiento: ${moveData.type}`);
    game.addMove(moveData); // Agregar el movimiento al juego
});

socket.on('lobbyError', (data) => {
    displayMessage(`Error: ${data.message}`);
});

socket.on('playerDisconnected', (data) => {
    displayMessage(`Jugador ${data.playerId} se ha desconectado.`);
});

socket.on('elementDestroyed', (data) => {
    // Encontrar y eliminar el elemento destruido de gameObjects
    game.gameObjects = game.gameObjects.filter(obj => 
        !(obj.constructor.name === data.type && 
          obj.team === data.team && 
          Math.abs(obj.x - data.x) < 1 && 
          Math.abs(obj.y - data.y) < 1)
    );
    displayMessage(`Un ${data.type} del equipo ${data.team} ha sido destruido.`);
});

socket.on('gamePaused', (isPaused) => {
    if (isPaused) {
        console.log("Paremos perri!");
        game.pause();
    } else {
        console.log("Continuemos perri!");
        game.resume();
    }
});

function login() {
    player.login(player.username);
}

function createLobby() {
    player.createLobby();
}

function joinLobby() {
    const lobbyId = document.getElementById('lobbyId').value;
    player.joinLobby(lobbyId);
}

function sendMove(strElement) {
    player.sendMove(strElement);
}

function displayMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
}

function update() {
    // Limpiar el canvas
    context.clearRect(0, 0, canvas.width, canvas.height); 
    game.update(); // Delegar la actualización a la instancia de Game
}

// Función para dibujar en el canvas dependiendo del movimiento
function drawMoveOnCanvas(element) {
    game.gameObjects.push(element);
    element.draw();
}

// Función para crear un elemento a partir de los datos recibidos
function createElementFromData(data) {
    return game.createElement(data);
}

login();
// Detectar cuando la pestaña se pone en segundo plano o vuelve al primer plano
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        socket.emit('gamePaused', true);
        console.log("PAUSA!");
    } else {
        socket.emit('gamePaused', false);
        console.log("PLAY!");
    }
});

// Iniciar el bucle de actualización a aproximadamente 30 FPS
const FPS = 30;
setInterval(update, 1000 / FPS);