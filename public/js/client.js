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
resizeCanvas();
createGameButtons();
window.addEventListener('resize', resizeCanvas);

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

// Function to resize the canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Update game objects if necessary
    if (game) {
        game.updateCanvasSize(canvas.width, canvas.height);
    }
    
    // Remove existing game buttons
    document.querySelectorAll('button:not(#gameLobbyModalBtn)').forEach(button => button.remove());
    
    // Recreate game buttons with new positions
    createGameButtons();
}

// Initial canvas resize
resizeCanvas();

// Add event listener for window resize
window.addEventListener('resize', resizeCanvas);

setInterval(update, 1000 / FPS);

// Add this function to create and style buttons
function createButton(text, x, y, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'game-button'; 
    button.style.position = 'absolute';
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
    button.style.width = '150px'; 
    button.style.height = '80px'; 
    button.style.fontSize = '22px'; 
    button.style.color = '#fff';
    button.style.backgroundColor = '#4CAF50';
    button.style.border = 'none';
    button.style.borderRadius = '20px';
    button.style.boxShadow = '0 12px #999'; 
    button.style.transition = 'all 0.3s ease';
    button.style.cursor = 'pointer';
    button.style.outline = 'none';
    button.style.zIndex = '10';

    button.onmouseover = () => button.style.backgroundColor = '#45a049';
    button.onmouseout = () => button.style.backgroundColor = '#4CAF50';
    button.onmousedown = () => {
        button.style.backgroundColor = '#3e8e41';
        button.style.boxShadow = '0 6px #666';
        button.style.transform = 'translateY(6px)'; 
    };
    button.onmouseup = () => {
        button.style.backgroundColor = '#45a049';
        button.style.boxShadow = '0 12px #999';
        button.style.transform = 'translateY(0)';
    };

    button.onclick = onClick;
    
    document.body.appendChild(button);
    return button;
}

// Add this function to create game buttons
function createGameButtons() {
    const buttonWidth = 150; 
    const buttonHeight = 80; 
    const spacing = 30; 
    const startX = (window.innerWidth - (buttonWidth * 3 + spacing * 2)) / 2;
    const startY = window.innerHeight - buttonHeight - 50; 

    createButton('Rock', startX, startY, () => sendMove('Rock'));
    createButton('Paper', startX + buttonWidth + spacing, startY, () => sendMove('Paper'));
    createButton('Scissors', startX + (buttonWidth + spacing) * 2, startY, () => sendMove('Scissors'));
}

// Function to open a modal with animation
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    setTimeout(() => {
        modal.querySelector('.modal-content').style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'translateY(0)';
    }, 10);
}

// Function to close a modal with animation
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.querySelector('.modal-content').style.opacity = '0';
    modal.querySelector('.modal-content').style.transform = 'translateY(-50px)';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Update the existing modal event listeners
document.getElementById("gameLobbyModalBtn").onclick = function() {
    openModal("gameLobbyModal");
}

// Close button functionality for all modals
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.onclick = function() {
        closeModal(this.closest('.modal').id);
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
}

// Update other functions that show modals
function showGameEndModal(winner) {
    document.getElementById('gameEndModalContent').textContent = `The game has ended. ${winner} wins! Would you like to play again?`;
    openModal('gameEndedModal');
}

function showPauseModal() {
    openModal('gamePausedModal');
}
