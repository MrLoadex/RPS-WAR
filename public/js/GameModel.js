class GameModel extends EventTarget
{
	constructor()
	{
		super();
		this.socket = io();
        this.init();
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
			this.dispatchEvent(new CustomEvent('usernameViability', { detail: { viability } }));
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
		this.socket.emit('checkUsername', username);
	}

	checkUsernameAndCreateLobby(username) {
		this.checkUsername(username);
	}

	checkUsernameAndJoinLobby(username, lobbyId) {
		this.checkUsername(username);
		this.socket.emit('checkLobbyId', lobbyId);
	}

	playerMove(moveData) {
		this.socket.emit('playerMove', moveData);
	}

};