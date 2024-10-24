class Player {
  constructor(username) {
    this.userID = null;
    this.username = username;
    this.team = null;
    this.currentLobbyId = null;
    this.lives = 3;
  }

  login(usernameInput) {
      if (usernameInput) {
          this.username = usernameInput;
          socket.emit('login', this.username);
        }
    }

    createLobby() {
        socket.emit('createLobby');
    }

    joinLobby(lobbyId){
        if (lobbyId) {
            socket.emit('joinLobby', lobbyId);
        }
    }

    disconnect() {
        socket.emit('disconnect');
    }
}
