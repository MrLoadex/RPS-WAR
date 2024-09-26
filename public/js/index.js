const socket = io();

let justCheckingUsername = false;
let createLobby = false;

function checkUsername() {
    const username = document.getElementById('username').value;
    justCheckingUsername = true;
    socket.emit('checkUsername', username);
}

function checkUsernameAndCreateLobby() {
    const username = document.getElementById('username').value;
    createLobby = true;
    justCheckingUsername = false;
    socket.emit('checkUsername', username);
}

function checkUsernameAndJoinLobby() {
    const username = document.getElementById('username').value;
    createLobby = false;
    justCheckingUsername = false;
    socket.emit('checkUsername', username);
}

function newGame() {
    const lobbyId = document.getElementById('lobbyId').value;
    const username = document.getElementById('username').value;
    window.location.href = `client.html?username=${encodeURIComponent(username)}&lobbyId=${encodeURIComponent(lobbyId)}`;
}

function unlockLobbyButtons() {
    document.querySelector('button[onclick="checkUsernameAndJoinLobby()"]').disabled = false;
    document.querySelector('button[onclick="checkUsernameAndCreateLobby()"]').disabled = false;
}

socket.on('usernameViability', (viability) => {
    if (!viability) {
        alert('Error: Nombre de usuario no disponible');
        return;
    }
    if (!justCheckingUsername) {
        newGame();
    } else {
        unlockLobbyButtons();
    }
});