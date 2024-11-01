class GameModel extends EventTarget
{
	constructor()
	{
		super();
		this.socket = io();
        this.init();
        this.username = '';
        this.lobbyId = '';
        this.isCheckingUsername = false;
        this.isCreatingLobby = false;
	}

    init()
    {
        this.initializeSocketListeners();
    }

	initializeSocketListeners() {
		this.socket.on('loginSuccess', (data) => {
			this.dispatchEvent(new CustomEvent('loginSuccess', { detail: data }));
		});

		this.socket.on('lobbyCreated', (data) => {
			this.dispatchEvent(new CustomEvent('lobbyCreated', { detail: data }));
		});

		this.socket.on('playerJoined', (data) => {
			this.dispatchEvent(new CustomEvent('playerJoined', { detail: data }));
		});

		this.socket.on('startGame', (data) => {
			this.dispatchEvent(new CustomEvent('startGame', { detail: data }));
		});

		this.socket.on('usernameViability', (viability) => {
            console.log(this.isCheckingUsername, this.isCreatingLobby);
            if (this.isCheckingUsername) {
                this.dispatchEvent(new CustomEvent('usernameViability', { detail: { viability } }));
            }
            else if (this.isCreatingLobby) {
                window.location.href = `client.html?username=${encodeURIComponent(this.username)}`;
            }
            else
            {
                window.location.href = `client.html?username=${encodeURIComponent(this.username)}&lobbyId=${encodeURIComponent(this.lobbyId)}`;
            }
		});

		this.socket.on('lobbyIdExists', (exists) => {
			if (!exists) {
				this.dispatchEvent(new CustomEvent('lobbyIdDoesNotExist'));
			} else {
				this.dispatchEvent(new CustomEvent('lobbyIdExists'));
			}
		});
	}

	checkUsername(username) {
		this.username = username;
		this.isCheckingUsername = true;
		this.socket.emit('checkUsername', username);
	}

	checkUsernameAndCreateLobby(username) {
        this.checkUsername(username);
        this.isCheckingUsername = false;    
        this.isCreatingLobby = true;
	}

	checkUsernameAndJoinLobby(lobbyId, username) {
        this.lobbyId = lobbyId;
        this.checkUsername(username);
        this.isCheckingUsername = false;  
        this.isCreatingLobby = false;
	}

	playerMove(moveData) {
		this.socket.emit('playerMove', moveData);
	}

};