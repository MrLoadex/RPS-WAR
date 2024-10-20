const socket = io();

let justCheckingUsername = false;
let createLobby = false;
let createNewGame = false;

function checkUsername() {
    const username = document.getElementById('username').value;
    if (!username) {
        alert('Insert a username');
        return;
    }
    justCheckingUsername = true;
    document.getElementById('welcomeUser').innerText = document.getElementById('username').value;
    document.getElementById('lobbyOptions').style.display = 'block';
    socket.emit('checkUsername', username);
}

function checkUsernameAndCreateLobby() {
    createNewGame = true;
    const username = document.getElementById('username').value;
    createLobby = true;
    justCheckingUsername = false;
    socket.emit('checkUsername', username);
}

function checkUsernameAndJoinLobby(event) {
    // Prevent default action if the event is triggered by a button click
    if (event) {
        event.preventDefault();
    }
    
    const lobbyId = document.getElementById('lobbyId').value;
    if (!lobbyId) {
        alert('Insert a lobby ID');
        return; // Exit the function if lobbyId is empty
    }
    
    const username = document.getElementById('username').value;
    createLobby = false;
    justCheckingUsername = false;
    socket.emit('checkLobbyId', lobbyId, (exists) => {
        if (exists) {
            socket.emit('checkUsername', username);
        } else {
            alert('Error: Lobby ID does not exist');
        }
    });
}

function newGame() {
    let lobbyId = 0;
    if (!createNewGame) {
        lobbyId = document.getElementById('lobbyId').value;
    }
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