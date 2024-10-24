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

// Configurar el tamaño del canvas para una resolución fija
canvas.width = 1024;
canvas.height = 920;
canvas.style.position = 'absolute';
canvas.style.top = '50%';
canvas.style.left = '50%';
canvas.style.transform = 'translate(-50%, -50%)';

const game = new Game(player.currentLobbyId, player, [player], context, FPS);
window.addEventListener('resize', resizeCanvas);

// REGION DE EVENTOS INTERNOS DEL JUEGO
game.addEventListener('lifeLost', () => {
    updateLives();
});

game.addEventListener('gameEnded', (e) => {
    const winnerUsername = e.detail; // This will now be the winner's username
    // console.log("Game Ended Event: Winner is", winnerUsername);

    // Show the winner's username in the modal
    showGameEndModal(winnerUsername);
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
    displayMessage(`Lobby created. ID: ${player.currentLobbyId}.`, "gameLobbyModalContent");
});

socket.on('playerJoined', (data) => {
    //Unir al player al lobby
    player.currentLobbyId = data.lobbyId;
    displayMessage(`Joined lobby: ${player.currentLobbyId}`, "gameLobbyModalContent");
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
    let background = new ImageGameObject(backgroundImage, context, canvas.width, canvas.height );
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
    displayMessage(`Lobby: ${player.currentLobbyId} - Player ${data.playerId} has disconnected.`, "gameLobbyModalContent");
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

function updateLives() {
    let players = game.players;

    socket.emit("playerLostLife", players);
}

// Función para crear un elemento a partir de los datos recibidos
function createElementFromData(data) {
    return game.createElement(data);
}

function resetGame() {
    socket.emit('resetGame');
}

// Function to resize the canvas
function resizeCanvas() {

    // Remove existing game buttons
    document.querySelectorAll('button:not(#gameLobbyModalBtn)').forEach(button => button.remove());
    
    // Recreate game buttons with new positions
    createGameButtons();
}

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
    
    // Check if the modal exists
    if (!modal) {
        console.error(`Modal with ID "${modalId}" not found.`);
        return; // Exit the function if modal is not found
    }

    modal.style.display = 'block';
    setTimeout(() => {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) { // Check if modalContent exists
            modalContent.style.opacity = '1';
            modalContent.style.transform = 'translateY(0)';
        } else {    
            console.error(`Modal content not found in modal with ID "${modalId}".`);
        }
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
    var modalContent = document.getElementById('gameEndModalContent');
    var modal = document.getElementById('gameEndedModal');


    if (modal && modalContent) { 
        // Abrir el modal (no asignar el resultado a modal)
        openModal('gameEndedModal');

        // Actualizar el contenido del modal con la información del ganador
        modalContent.textContent = `${winner} ha ganado. ¿Quieres jugar de nuevo?`;
        const playAgainBtn = document.createElement('button');
        playAgainBtn.textContent = 'Play Again';
        playAgainBtn.onclick = function() {
            resetGame();
            closeModal('gameEndedModal');
        };
        modalContent.appendChild(playAgainBtn);
    } else {
        console.error('Modal o contenido del modal no encontrado.');
    }
}

function showPauseModal() {
    openModal('gamePausedModal');
}

// REGION DE INICIALIZACION 2
socket.emit('login', player.username);
if (lobbyId) {
    joinLobby();
} else {
    createLobby();
}


// Initial canvas resize
resizeCanvas();
createGameButtons();

// Add event listener for window resize
window.addEventListener('resize', resizeCanvas);

setInterval(update, 1000 / FPS);
