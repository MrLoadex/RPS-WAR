class Player {
  constructor(username) {
    this.userID = null;
    this.username = username;
    this.team = null;
    this.currentLobbyId = null;
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

    sendMove(strElement) {
        let data = {
            username: this.username,
            type: strElement,
            team: this.team,
        };
        socket.emit('playerMove', data);
    }

    disconnect() {
        socket.emit('disconnect');
    }
}
