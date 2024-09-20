const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });
const port = 3000;

app.use(express.static('public'));

// Serve different pages
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/game', (req, res) => {
    res.sendFile(__dirname + '/public/game.html'); 
});

// Variables for lobbies and users
const users = {};  // Store connected users
const lobbies = {};  // Store created lobbies

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user login from login.html
    socket.on('login', (username) => {
        users[socket.id] = { id: socket.id, username: username };
        console.log(`User logged in: ${username} (ID: ${socket.id})`);
        socket.emit('loginSuccess', { username: username });
    });

    // Handle lobby creation
    socket.on('createLobby', () => {
        if (!users[socket.id]) {
            socket.emit('lobbyError', { message: 'User not logged in' });
            return;
        }

        const lobbyId = generateLobbyId();
        lobbies[lobbyId] = { id: lobbyId, players: [], gameStarted: false };
        
        console.log(`Lobby created: ${lobbyId} by ${users[socket.id].username}`);
        socket.emit('lobbyCreated', { lobbyId: lobbyId });
    });

    // Handle joining an existing lobby
    socket.on('joinLobby', (lobbyId) => {
        console.log(`Attempt to join lobby: ${lobbyId} by ${users[socket.id]?.username}`);
        
        if (!users[socket.id]) {
            socket.emit('lobbyError', { message: 'User not logged in' });
            return;
        }

        if (!lobbies[lobbyId]) {
            console.log(`Lobby not found: ${lobbyId}`);
            socket.emit('lobbyError', { message: 'Lobby not found' });
            return;
        }

        if (lobbies[lobbyId].players.length >= 2) {
            socket.emit('lobbyError', { message: 'Lobby is full' });
            return;
        }

        const team = lobbies[lobbyId].players.length === 0 ? 'left' : 'right';
        users[socket.id].lobbyId = lobbyId;
        users[socket.id].team = team;
        lobbies[lobbyId].players.push(users[socket.id]);

        console.log(`User ${users[socket.id].username} (ID: ${socket.id}) joined lobby: ${lobbyId} as ${team}`);
        socket.join(lobbyId);
        socket.emit('playerJoined', { lobbyId: lobbyId, team: team });

        if (lobbies[lobbyId].players.length === 2) {
            lobbies[lobbyId].gameStarted = true;
            console.log(`Game started in lobby: ${lobbyId}`);
            console.log(`Players: ${JSON.stringify(lobbies[lobbyId].players)}`);
            io.to(lobbyId).emit('startGame', { 
                lobbyId: lobbyId, 
                players: lobbies[lobbyId].players.map(p => ({ username: p.username, team: p.team }))
            });
        }
    });

    // Handle player moves during the game
    socket.on('playerMove', (data) => {
        const player = users[socket.id];
        if (!player || !player.lobbyId) {
            socket.emit('lobbyError', { message: 'You are not in a lobby' });
            return;
        }

        const lobby = lobbies[player.lobbyId];
        if (!lobby || !lobby.gameStarted) {
            socket.emit('lobbyError', { message: 'Game has not started yet' });
            return;
        }

        console.log(`Player ${player.username} (ID: ${socket.id}, Team: ${player.team}) made a move: ${data.move}`);

        io.to(player.lobbyId).emit('playerMove', {
            username: player.username,
            move: data.move,
            team: player.team
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        if (users[socket.id]) {
            const lobbyId = users[socket.id].lobbyId;
            if (lobbyId && lobbies[lobbyId]) {
                lobbies[lobbyId].players = lobbies[lobbyId].players.filter(p => p.id !== socket.id);
                if (lobbies[lobbyId].players.length === 0) {
                    console.log(`Lobby ${lobbyId} is empty, but keeping it for reconnection`);
                    // Instead of deleting, we'll keep the lobby for a while
                    setTimeout(() => {
                        if (lobbies[lobbyId] && lobbies[lobbyId].players.length === 0) {
                            console.log(`Deleting empty lobby: ${lobbyId}`);
                            delete lobbies[lobbyId];
                        }
                    }, 60000); // Keep lobby for 1 minute
                }
            }
            delete users[socket.id];
        }
    });

    // Handle rejoining a lobby
    socket.on('rejoinLobby', (data) => {
        const { username, lobbyId } = data;
        console.log(`Attempt to rejoin lobby: ${lobbyId} by ${username}`);
        
        if (!lobbies[lobbyId]) {
            console.log(`Lobby not found for rejoin: ${lobbyId}`);
            socket.emit('lobbyError', { message: 'Lobby not found' });
            return;
        }

        const existingPlayer = lobbies[lobbyId].players.find(p => p.username === username);
        if (existingPlayer) {
            // Update the existing player's socket ID
            existingPlayer.id = socket.id;
            users[socket.id] = existingPlayer;
        } else {
            // If the player doesn't exist, add them as a new player
            const team = lobbies[lobbyId].players.length === 0 ? 'left' : 'right';
            users[socket.id] = { id: socket.id, username: username, lobbyId: lobbyId, team: team };
            lobbies[lobbyId].players.push(users[socket.id]);
        }

        socket.join(lobbyId);
        console.log(`User ${username} rejoined lobby: ${lobbyId} as ${users[socket.id].team}`);
        socket.emit('rejoinSuccess', { lobbyId: lobbyId, team: users[socket.id].team, username: username });

        // Emit updated player list to all clients in the lobby
        io.to(lobbyId).emit('updatePlayers', {
            players: lobbies[lobbyId].players.map(p => ({ username: p.username, team: p.team }))
        });
    });
});

// Utility function to generate unique lobby IDs
function generateLobbyId() {
    return Math.floor(10000 + Math.random() * 90000).toString();  // Example: generates a random 5-digit lobby ID
}

server.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`);
});
