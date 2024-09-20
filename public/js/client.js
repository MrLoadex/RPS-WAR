const socket = io();

// Variables globales
let gameObjects = [];
let userId = localStorage.getItem('username') || null;
let username = localStorage.getItem('username') || '';
let currentLobbyId = localStorage.getItem('lobbyId') || null;
let playerTeam = localStorage.getItem('playerTeam') || null;
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

// Initialize the game once the page loads
function initGame() {
    console.log('initGame called');
    if (username && currentLobbyId) {
        console.log(`Attempting to rejoin lobby ${currentLobbyId} as ${username}`);
        displayMessage(`Attempting to rejoin lobby ${currentLobbyId} as ${username}.`);
        socket.emit('rejoinLobby', { username: username, lobbyId: currentLobbyId });
    } else {
        console.log('No username or lobby ID found');
        displayMessage('Please log in and join or create a lobby.');
        // Redirect to login page if we're not on it already
        if (window.location.pathname !== '/') {
            window.location.href = '/login.html';
        }
    }
}

socket.on('rejoinSuccess', (data) => {
    playerTeam = data.team;
    displayMessage(`Successfully rejoined lobby ${data.lobbyId} as team ${data.team}.`);
    // Add any additional setup needed for the game
});

socket.on('startGame', (data) => {
    console.log(`Game started in lobby ${data.lobbyId}`);
    console.log(`Players: ${JSON.stringify(data.players)}`);
    data.players.forEach(player => {
        displayMessage(`Player: ${player.username}, Team: ${player.team}`);
    });
    // Add game start logic here
});

socket.on('playerMove', (data) => {
    console.log(`Received move: Player ${data.playerId} (${data.team}) made a move: ${data.move}`);
    displayMessage(`Player ${data.playerId} (${data.team}) made a move: ${data.move}`);
    drawMoveOnCanvas(data.move, data.team);
});

socket.on('playerDisconnected', (data) => {
    displayMessage(`Player ${data.playerId} has disconnected.`);
});

socket.on('lobbyError', (data) => {
    displayMessage(`Error: ${data.message}`);
    // Optionally, redirect to login page after a short delay
    setTimeout(() => {
        window.location.href = '/';
    }, 3000);
});

socket.on('elementDestroyed', (data) => {
    gameObjects = gameObjects.filter(obj => 
        !(obj.constructor.name === data.type && 
          obj.team === data.team && 
          Math.abs(obj.x - data.x) < 1 && 
          Math.abs(obj.y - data.y) < 1)
    );
    displayMessage(`A ${data.type} from team ${data.team} was destroyed.`);
});

socket.on('updatePlayers', (data) => {
    console.log('Received updated player list:', data.players);
    // Update the displayed player list
    displayMessage('Players in lobby:');
    data.players.forEach(player => {
        displayMessage(`${player.username} (${player.team})`);
    });
});

function displayMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
}

// Update loop
function update() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].update();
    }

    for (let i = 0; i < gameObjects.length; i++) {
        for (let j = i + 1; j < gameObjects.length; j++) {
            if (gameObjects[i].checkCollision(gameObjects[j])) {
                gameObjects[i].handleCollision(gameObjects[j]);
            }
        }
    }

    gameObjects = gameObjects.filter(obj => !obj.isDestroyed);
}

const FPS = 30;
setInterval(update, 1000 / FPS);

function drawMoveOnCanvas(move, team) {
    let element;
    const x = team === 'left' ? 50 : canvas.width - 50;
    const y = Math.random() * (canvas.height - 100) + 50; // Random y position

    switch (move) {
        case 'Rock':
            element = new Rock(x, y, team, context);
            break;
        case 'Paper':
            element = new Paper(x, y, team, context);
            break;
        case 'Scissors':
            element = new Scissors(x, y, team, context);
            break;
    }

    if (element) {
        gameObjects.push(element);
    }
}

// Define sendMove function and attach it to window
window.sendMove = function(move) {
    if (currentLobbyId && playerTeam && username) {
        console.log(`Sending move: ${move} for ${username} (${playerTeam})`);
        socket.emit('playerMove', { move: move, team: playerTeam, username: username });
        displayMessage(`You (${username}) played: ${move}`);
    } else {
        console.error('Not in a lobby, team not assigned, or username not set');
        displayMessage('Error: Not in a lobby, team not assigned, or username not set');
    }
}
// Call initGame once the game page loads
window.onload = initGame;

