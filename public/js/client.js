const socket = io();

// Variables globales
let userId = null;
let username = '';
let currentLobbyId = null;
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
    displayMessage(`Lobby creado con ID: ${currentLobbyId}`);
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
    displayMessage(`Jugadores en el lobby: ${data.players.join(', ')}`);
});

socket.on('startGame', (data) => {
    displayMessage(`¡El juego ha comenzado en el lobby ${data.lobbyId}!`);
});

function sendMove(move) {
    socket.emit('playerMove', { move });  // Enviar el movimiento al servidor
}

socket.on('playerMove', (data) => {
    displayMessage(`Jugador ${data.playerId} hizo un movimiento: ${data.move}`);
    drawMoveOnCanvas(data.move);  // Llama a la función para dibujar en el canvas
});

socket.on('lobbyError', (data) => {
    displayMessage(`Error: ${data.message}`);
});

socket.on('playerDisconnected', (data) => {
    displayMessage(`Jugador ${data.playerId} se ha desconectado.`);
});

function displayMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
}

// Función para dibujar en el canvas dependiendo del movimiento
function drawMoveOnCanvas(move) {
    context.clearRect(0, 0, canvas.width, canvas.height);  // Limpiar el canvas
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    switch (move) {
        case 'Rock':  // Dibuja un círculo para "rock"
            context.beginPath();
            context.arc(centerX, centerY, 50, 0, Math.PI * 2);
            context.fillStyle = 'gray';
            context.fill();
            break;
        case 'Paper':  // Dibuja un cuadrado para "paper"
            context.fillStyle = 'blue';
            context.fillRect(centerX - 50, centerY - 50, 100, 100);
            break;
        case 'Scissors':  // Dibuja un triángulo para "scissors"
            context.beginPath();
            context.moveTo(centerX, centerY - 50);
            context.lineTo(centerX - 50, centerY + 50);
            context.lineTo(centerX + 50, centerY + 50);
            context.closePath();
            context.fillStyle = 'red';
            context.fill();
            break;
        default:
            console.error('Movimiento no reconocido:', move);
    }
}
