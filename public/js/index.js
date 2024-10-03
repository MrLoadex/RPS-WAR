const socket = io();

let justCheckingUsername = false;
let createLobby = false;

function checkUsername() {
    const username = document.getElementById('username').value;
    justCheckingUsername = true;
    document.getElementById('welcomeUser').innerText = document.getElementById('username').value;
    document.getElementById('lobbyOptions').style.display = 'block';
    socket.emit('checkUsername', username);
}

function checkUsernameAndCreateLobby() {
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
    socket.emit('checkUsername', username);
}

function newGame(lobbyId) {
    const username = document.getElementById('username').value;
    lobbyDoesExist = true;
    window.location.href = `client.html?username=${encodeURIComponent(username)}&lobbyId=${(lobbyId)}`;
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
        if (createLobby) {
            socket.emit('checkLobby', lobbyId);
        } else {
            newGame(0);
        }
    } else {
        unlockLobbyButtons();
    }
});

socket.on('lobbyExists', (exists) => {
    if (exists) {
        newGame(document.getElementById('lobbyId').value);
    }
});