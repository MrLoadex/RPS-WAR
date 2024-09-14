const socket = io();

// Variables globales
let gameObjects = [];
let userId = null;
let username = '';
let currentLobbyId = null;
let playerTeam = null;
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

function login() {
    username = document.getElementById('username').value;
    if (username) {
        socket.emit('login', username);
    }
}

socket.on('loginSuccess', (data) => {
    userId = data.userId;
    username = data.username;
    displayMessage(`Bienvenido, ${username}!`);
});

function createLobby() {
    socket.emit('createLobby');
}

socket.on('lobbyCreated', (data) => {
    currentLobbyId = data.lobbyId;
    playerTeam = data.team;
    displayMessage(`Lobby creado con ID: ${currentLobbyId}. Eres el equipo ${playerTeam}`);
});

function joinLobby() {
    const lobbyId = document.getElementById('lobbyId').value;
    if (lobbyId) {
        socket.emit('joinLobby', lobbyId);
    }
}

socket.on('playerJoined', (data) => {
    currentLobbyId = data.lobbyId;
    displayMessage(`Te has unido al lobby: ${currentLobbyId}`);
    data.players.forEach(player => {
        displayMessage(`Jugador: ${player.username}, Equipo: ${player.team}`);
        if (player.username === username) {
            playerTeam = player.team;
        }
    });
});

socket.on('startGame', (data) => {
    displayMessage(`¡El juego ha comenzado en el lobby ${data.lobbyId}!`);
    data.players.forEach(player => {
        displayMessage(`Jugador: ${player.username}, Equipo: ${player.team}`);
    });
});

function sendMove(move) {
    socket.emit('playerMove', { move });
}

socket.on('playerMove', (data) => {
    displayMessage(`Jugador ${data.playerId} (${data.team}) hizo un movimiento: ${data.move}`);
    drawMoveOnCanvas(data.move, data.team);
});

socket.on('lobbyError', (data) => {
    displayMessage(`Error: ${data.message}`);
});

socket.on('playerDisconnected', (data) => {
    displayMessage(`Jugador ${data.playerId} se ha desconectado.`);
});

socket.on('elementDestroyed', (data) => {
    // Encontrar y eliminar el elemento destruido de gameObjects
    gameObjects = gameObjects.filter(obj => 
        !(obj.constructor.name === data.type && 
          obj.team === data.team && 
          Math.abs(obj.x - data.x) < 1 && 
          Math.abs(obj.y - data.y) < 1)
    );
    displayMessage(`Un ${data.type} del equipo ${data.team} ha sido destruido.`);
});

function displayMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
}

function update() {
    // Limpiar el canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    for(let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].update();
    }

    // Verificar colisiones
    for(let i = 0; i < gameObjects.length; i++) {
        for(let j = i + 1; j < gameObjects.length; j++) {
            if (gameObjects[i].checkCollision(gameObjects[j])) {
                gameObjects[i].handleCollision(gameObjects[j]);
            }
        }
    }

    // Eliminar objetos destruidos
    gameObjects = gameObjects.filter(obj => !obj.isDestroyed);
}

// Iniciar el bucle de actualización a aproximadamente 30 FPS
const FPS = 30;
setInterval(update, 1000 / FPS);

// Función para dibujar en el canvas dependiendo del movimiento
function drawMoveOnCanvas(move, team) {
    context.clearRect(0, 0, canvas.width, canvas.height);  // Limpiar el canvas
    
    let element;

    switch (move) {
        case 'Rock':
            element = new Rock(50, 'blue', team, context);
            gameObjects.push(element);
            break;
        case 'Paper':
            element = new Paper(75, 'red', team, context);
            gameObjects.push(element);
            break;
        case 'Scissors':
            element = new Scissors(60, 'grey', team, context);
            gameObjects.push(element);
            break;
        default:
            console.error('Movimiento no reconocido:', move);
    }

    if (element) {
        element.draw();
    }
}
