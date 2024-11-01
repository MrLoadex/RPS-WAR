

class GameController extends EventTarget
{
	constructor(model, view)
	{
		super();
		this.model = model;
		this.view = view;

		// Vincular el contexto de 'this' para los métodos
		this.onVerifyUser = this.onVerifyUser.bind(this);
		this.onCreateLobby = this.onCreateLobby.bind(this);
		this.onJoinLobby = this.onJoinLobby.bind(this);
		this.onUsernameViability = this.onUsernameViability.bind(this);

	}
	
	
	init()
	{
        //Escuchar eventos del modelo
        this.model.addEventListener('usernameViability', this.onUsernameViability);


        // Escuchar el evento 'verifyUser' en la vista de login
        this.view.gameLoginView.addEventListener('verifyUser', this.onVerifyUser);
        this.view.gameLoginView.addEventListener('createLobby', this.onCreateLobby);
        this.view.gameLoginView.addEventListener('joinLobby', this.onJoinLobby);

		this.addEventListener('userLogged', this.onUserLogged);
		this.addEventListener('loggingError', this.onUserLoggingError);
		
		this.view.setView('login');
	}

    //Eventos de las vistas
	onVerifyUser(event) {
		const username = event.detail.username;
		// Avisar al modelo que el usuario ha sido verificado
		this.model.checkUsername(username);
	}

	onCreateLobby(event) {
		const username = event.detail.username;
		// Avisar al modelo que el usuario ha creado un lobby
		this.model.checkUsernameAndCreateLobby(username);
	}

	onJoinLobby(event) {
		const username = event.detail.username;
		const lobbyId = event.detail.lobbyId;
		// Avisar al modelo que el usuario ha unido a un lobby
		this.model.checkUsernameAndJoinLobby(lobbyId, username);
	}

    //Eventos del modelo
    onUsernameViability(event) {
        const viability = event.detail.viability;
        if (!viability) {
            this.view.gameLoginView.notify('usernameNotAvailable');
        } else {
            this.view.gameLoginView.notify('usernameAvailable');
        }
    }

	onUserLogged()
	{
		this.view.setView('game');
	}
	
	onUserLoggingError()
	{
		this.view.notify('loggingError');
	}
};

export default GameController;

