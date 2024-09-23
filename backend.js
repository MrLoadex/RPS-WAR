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
        const lobbyId = Math.floor(10000 + Math.random() * 90000).toString();
        lobbies[lobbyId] = {
            players: [socket.id],
            gameStarted: false
        };
        users[socket.id].lobbyId = lobbyId;
        socket.join(lobbyId);
        socket.emit('lobbyCreated', { lobbyId });
    });

    // Handle joining an existing lobby
    socket.on('joinLobby', (lobbyId) => {
        if (lobbies[lobbyId] && lobbies[lobbyId].players.length < 2) {
            lobbies[lobbyId].players.push(socket.id);
            users[socket.id].lobbyId = lobbyId;
            socket.join(lobbyId);

            // Enviar nombres de los jugadores en lugar de IDs
            const playerNames = lobbies[lobbyId].players.map(id => users[id]?.username || 'Desconocido');
            io.to(lobbyId).emit('playerJoined', { lobbyId, players: playerNames });

            if (lobbies[lobbyId].players.length === 2) {
                lobbies[lobbyId].gameStarted = true;
                io.to(lobbyId).emit('startGame', { lobbyId });
            }
        } else {
            socket.emit('lobbyError', { message: 'Lobby no disponible o lleno' });
        }
    });

    // Lógica del juego
    socket.on('playerMove', ({ move }) => {
        const lobbyId = users[socket.id]?.lobbyId;
        if (lobbyId && lobbies[lobbyId].gameStarted) {
            io.to(lobbyId).emit('playerMove', { playerId: users[socket.id].username, move });
            // Aquí implementarías la lógica del juego, verificando los movimientos y actualizando el estado del juego
        }
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
