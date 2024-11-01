class GameLoginView extends HTMLElement {
    constructor() {
        super();
        // Crear el título principal
        this.titulo = document.createElement('h1');
        this.titulo.textContent = 'ROCK PAPER SCISSORS WAR';
        this.appendChild(this.titulo);
        
        // Input de Nombre de Usuario
        this.inputUsername = document.createElement('input');
        this.inputUsername.type = 'text';
        this.inputUsername.id = 'username';
        this.inputUsername.placeholder = 'Type your username';
        this.appendChild(this.inputUsername);
    
        this.botonVerificar = document.createElement('button');
        this.botonVerificar.id = 'verifyUserBtn';
        this.botonVerificar.textContent = '🔁 Verify User';
        this.appendChild(this.botonVerificar);
    
        // Opciones del Lobby (ocultas inicialmente)
        this.opcionesLobby = document.createElement('div');
        this.opcionesLobby.id = 'lobbyOptions';
        this.opcionesLobby.style.display = 'none';
    
        this.bienvenida = document.createElement('h2');
        this.bienvenida.innerHTML = '¡Welcome, ';
        this.usuarioBienvenida = document.createElement('span');
        this.usuarioBienvenida.id = 'welcomeUser';
        this.bienvenida.appendChild(this.usuarioBienvenida);
        this.bienvenida.appendChild(document.createTextNode('!'));
        this.opcionesLobby.appendChild(this.bienvenida);
    
        this.botonCrearLobby = document.createElement('button');
        this.botonCrearLobby.id = 'createLobbyBtn';
        this.botonCrearLobby.textContent = 'Create Lobby';
        this.opcionesLobby.appendChild(this.botonCrearLobby);
    
        this.saltoLinea = document.createElement('br');
        this.opcionesLobby.appendChild(this.saltoLinea);
    
        this.inputLobbyId = document.createElement('input');
        this.inputLobbyId.type = 'text';
        this.inputLobbyId.id = 'lobbyId';
        this.inputLobbyId.placeholder = 'Lobby ID';
        this.opcionesLobby.appendChild(this.inputLobbyId);
    
        this.botonUnirseLobby = document.createElement('button');
        this.botonUnirseLobby.id = 'joinLobbyBtn';
        this.botonUnirseLobby.textContent = 'Join';
        this.opcionesLobby.appendChild(this.botonUnirseLobby);
    
        this.appendChild(this.opcionesLobby);
    
        this.divMensajes = document.createElement('div');
        this.divMensajes.id = 'messages';
        this.appendChild(this.divMensajes);
    
        // Sección de los fundadores
        this.seccionFundadores = document.createElement('div');
        this.seccionFundadores.className = 'founders';
    
        this.tituloFundadores = document.createElement('h2');
        this.tituloFundadores.textContent = 'Developers';
        this.seccionFundadores.appendChild(this.tituloFundadores);
    
        this.listaFundadores = document.createElement('ul');
    
        this.fundadores = ['Acuña Aldana', 'Torres Martin', 'Nuñez Julian'];
        this.fundadores.forEach(nombre => {
            const elementoLista = document.createElement('li');
            elementoLista.textContent = nombre;
            this.listaFundadores.appendChild(elementoLista);
        });
    
        this.seccionFundadores.appendChild(this.listaFundadores);
        this.appendChild(this.seccionFundadores);
        this.style.display = 'none';
    }

    connectedCallback() {

        // Asignar el manejador de eventos
        this.querySelector('#verifyUserBtn').onclick = () => this.checkUsername();
        this.querySelector('#createLobbyBtn').onclick = () => this.checkUsernameAndCreateLobby();
        this.querySelector('#joinLobbyBtn').onclick = () => this.checkUsernameAndJoinLobby();

    }

    setView() {
        this.style.display = 'block';
    }

    checkUsername() {
        // Lógica para verificar el nombre de usuario
        const username = this.querySelector('#username').value;
        // Despachar un evento personalizado
        const event = new CustomEvent('verifyUser', { detail: { username } });
        this.dispatchEvent(event);
    }

    checkUsernameAndCreateLobby() {
        const username = this.querySelector('#username').value;
        // Despachar un evento personalizado
        const event = new CustomEvent('createLobby', { detail: { username } });
        this.dispatchEvent(event);
    }

    checkUsernameAndJoinLobby() {
        const username = this.querySelector('#username').value;
        const lobbyId = this.querySelector('#lobbyId').value;
        // Despachar un evento personalizado
        const event = new CustomEvent('joinLobby', { detail: { username, lobbyId } });
        this.dispatchEvent(event);
    }

    notify(message) {
        if (message === 'usernameNotAvailable') {
            this.querySelector('#messages').textContent = 'Username already taken';
        } else if (message === 'usernameAvailable') {
            this.querySelector('#messages').textContent = 'Username available';
            // Lógica para mostrar las opciones del lobby cuando el nombre de usuario es disponible
            this.querySelector('#lobbyOptions').style.display = 'block';
            this.querySelector('#welcomeUser').textContent = this.querySelector('#username').value;
        } else if (message === 'lobbyIdDoesNotExist') {
            this.querySelector('#messages').textContent = 'Lobby ID does not exist';
        } else if (message === 'lobbyIdExists') {
            this.querySelector('#messages').textContent = 'Lobby ID exists';
        }
    }
}

// Registrar el elemento personalizado 'game-login-view'
customElements.define('game-login-view', GameLoginView);

export default GameLoginView;
