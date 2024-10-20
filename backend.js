const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { pingInterval: 200, pingTimeout: 1000 })
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Variables para los lobbys y usuarios
const users = {};  // Almacena los usuarios conectados
const lobbies = {};  // Almacena los lobbys creados

io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);
   
    // Manejo de login
    socket.on('login', (username) => {
        users[socket.id] = { username: username, lobbyId: null };
        socket.emit('loginSuccess', { userId: socket.id, username });
    });

    // Creación de un nuevo lobby
    socket.on('createLobby', () => {
        const lobbyId = Math.floor(10000 + Math.random() * 90000).toString();
        lobbies[lobbyId] = {
            players: [{id: socket.id, team: 'left'}],
            gameStarted: false
        };
        users[socket.id].lobbyId = lobbyId;
        users[socket.id].team = 'left';
        socket.join(lobbyId);
        socket.emit('lobbyCreated', { lobbyId, team: 'left' });
    });

    // Unirse a un lobby existente
    socket.on('joinLobby', (lobbyId) => {
        if (lobbies[lobbyId] && lobbies[lobbyId].players.length < 2) {
            const team = lobbies[lobbyId].players[0].team === 'left' ? 'right' : 'left';
            lobbies[lobbyId].players.push({id: socket.id, team});
            users[socket.id].lobbyId = lobbyId;
            users[socket.id].team = team;
            socket.join(lobbyId);

            const playerInfo = lobbies[lobbyId].players.map(p => ({
                username: users[p.id]?.username || 'Desconocido',
                team: p.team
            }));
            io.to(lobbyId).emit('playerJoined', { lobbyId, players: playerInfo });

            if (lobbies[lobbyId].players.length === 2) {
                lobbies[lobbyId].gameStarted = true;
                io.to(lobbyId).emit('startGame', { lobbyId, players: playerInfo });
            }
        } else {
            socket.emit('lobbyError', { message: 'Lobby no disponible o lleno' });
        }
    });

    // Lógica del juego
    socket.on('playerMove', (data) => {
        const lobbyId = users[socket.id]?.lobbyId;
        if (lobbyId && lobbies[lobbyId].gameStarted) {
            const moveData = {
                username: data.username,
                team: data.team,
                type: data.type,
            };
            io.to(lobbyId).emit('playerMove', moveData); 
        }
    });

    // Manejo del evento 'gamePaused'
    socket.on('gamePaused', (isPaused) => {
        const lobbyId = users[socket.id]?.lobbyId;
        if (lobbyId) {
            io.to(lobbyId).emit('gamePaused', isPaused);
        }
    });


    // Manejo del evento 'playerLostLife'
    socket.on('playerLostLife', (players) => {
        const lobbyId = users[socket.id]?.lobbyId;
        if (lobbyId && lobbies[lobbyId].gameStarted) {
            io.to(lobbyId).emit('playerLostLife', players);
        }
    });

    // Manejo del evento 'resetGame'
    socket.on('resetGame', () => {
        const lobbyId = users[socket.id]?.lobbyId;
        if (lobbyId && lobbies[lobbyId].gameStarted) {
            io.to(lobbyId).emit('resetGame');
        }
    });

    // Desconexión
    socket.on('disconnect', () => {
        const lobbyId = users[socket.id]?.lobbyId;
        if (lobbyId && lobbies[lobbyId]) {
            lobbies[lobbyId].players = lobbies[lobbyId].players.filter(id => id !== socket.id);
            if (lobbies[lobbyId].players.length === 0) {
                delete lobbies[lobbyId];
            } else {
                io.to(lobbyId).emit('playerDisconnected', { playerId: users[socket.id]?.username || 'Desconocido' });
            }
        }
        delete users[socket.id];
        console.log(`Usuario desconectado: ${socket.id}`);
    });

    // Manejo de elementos destruidos
    socket.on('elementDestroyed', (data) => {
        const lobbyId = users[socket.id]?.lobbyId;
        if (lobbyId && lobbies[lobbyId].gameStarted) {
            io.to(lobbyId).emit('elementDestroyed', data);
        }
    });

    // Escuchar evento checkUsername con el parámetro username
    socket.on('checkUsername', (username) => {
        const isAvailable = !Object.values(users).some(user => user.username === username);
        socket.emit('usernameViability', isAvailable);
    });

    // Add this inside the io.on('connection', (socket) => { ... }) block
    socket.on('checkLobbyId', (lobbyId, callback) => {
        const exists = !!lobbies[lobbyId]; // Check if the lobby exists
        callback(exists); // Send the result back to the client
    });
});

server.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`);
});