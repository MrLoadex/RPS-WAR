const socket = io();

// Variables globales
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

function displayMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
}

function update()
{
    // Limpiar el canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    /* 
    FOR OBJETOS EN PANTALLA (incluyendo el escenario)
    objetoEnPantalla.update();
     */
}
// Función para dibujar en el canvas dependiendo del movimiento
function drawMoveOnCanvas(move, team) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    let element;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    switch (move) {
        case 'Rock':
            element = new Rock(centerX, centerY, 50, 'blue', team);
            break;
        case 'Paper':
            element = new Paper(centerX, centerY, 100, 'red', team);
            break;
        case 'Scissors':
            element = new Scissors(centerX, centerY, 100, 'grey', team);
            break;
        default:
            console.error('Movimiento no reconocido:', move);
    }

    if (element) {
        element.draw();
    }
}
