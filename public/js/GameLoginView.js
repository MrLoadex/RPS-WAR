class GameLoginView extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <h1>ROCK PAPER SCISSORS WAR</h1>
            
            <!-- Input de Nombre de Usuario -->
            <input type="text" id="username" placeholder="Type your username">
            <button id="verifyUserBtn">🔁 Verify User</button>
            
            <!-- Opciones del Lobby (ocultas inicialmente) -->
            <div id="lobbyOptions" style="display: none;">
                <h2>¡Welcome, <span id="welcomeUser"></span>!</h2>
                <button id="createLobbyBtn">Create Lobby</button><br>
                <input type="text" id="lobbyId" placeholder="Lobby ID">
                <button id="joinLobbyBtn">Join</button>
            </div>
            
            <div id="messages"></div>
            
            <!-- Sección de los fundadores -->
            <div class="founders">
                <h2>Developers</h2>
                <ul>
                    <li>Acuña Aldana</li>
                    <li>Torres Martin</li>
                    <li>Nuñez Julian</li>
                </ul>
            </div>
        `;
        this.style.display = 'none';

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
