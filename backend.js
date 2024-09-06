const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })
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
            players: [socket.id],
            gameStarted: false
        };
        users[socket.id].lobbyId = lobbyId;
        socket.join(lobbyId);
        socket.emit('lobbyCreated', { lobbyId });
    });

    // Unirse a un lobby existente
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
});

server.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
