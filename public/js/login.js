const socket = io();

// Handle login
function login() {
    const usernameInput = document.getElementById('username').value.trim();
    if (usernameInput) {
        localStorage.setItem('username', usernameInput);
        socket.emit('login', usernameInput);
    } else {
        alert('Please enter a username');
    }
}

socket.on('loginSuccess', (data) => {
    document.getElementById('welcomeUser').textContent = data.username;
    document.getElementById('lobbyOptions').style.display = 'block';
});

function handleLoginSuccess(username) {
    localStorage.setItem('username', username);
    document.getElementById('welcomeUser').textContent = username;
    
    // Show lobby options
    document.getElementById('lobbyOptions').style.display = 'block';
}

// Handle lobby creation
function createLobby() {
    socket.emit('createLobby');
}

socket.on('lobbyCreated', (data) => {
    console.log(`Lobby created with ID: ${data.lobbyId}`);
    joinLobby(data.lobbyId);
});

// Handle joining a lobby
function joinLobby(lobbyId) {
    lobbyId = lobbyId || document.getElementById('lobbyId').value.trim();
    if (lobbyId) {
        console.log(`Attempting to join lobby: ${lobbyId}`);
        socket.emit('joinLobby', lobbyId);
    } else {
        alert('Please enter a valid lobby ID');
    }
}

socket.on('playerJoined', (data) => {
    console.log(`Joined lobby ${data.lobbyId} as team ${data.team}`);
    localStorage.setItem('lobbyId', data.lobbyId);
    localStorage.setItem('playerTeam', data.team);
    alert(`Joined lobby ${data.lobbyId}. You are on team ${data.team}.`);
    window.location.href = '/game';
});

socket.on('lobbyError', (data) => {
    console.error(`Lobby error: ${data.message}`);
    alert(`Error: ${data.message}`);
});
