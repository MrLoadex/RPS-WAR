//import client from "./client.js";

class GameMainView extends HTMLElement
{
    constructor() {
        super();
        this.username = '';
        this.lobbyId = '';
        // Crear el canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'gameCanvas';
        this.appendChild(this.canvas);

        // Crear el botón del modal del lobby
        this.lobbyModalButton = document.createElement('button');
        this.lobbyModalButton.id = 'gameLobbyModalBtn';
        this.lobbyModalButton.textContent = 'Lobby Id';
        this.appendChild(this.lobbyModalButton);

        // Crear el modal del lobby
        this.lobbyModal = document.createElement('div');
        this.lobbyModal.id = 'gameLobbyModal';
        this.lobbyModal.className = 'modal';
        this.lobbyModal.style.display = 'block';
        this.appendChild(this.lobbyModal);

        // Crear el contenido del modal del lobby
        this.lobbyModalContent = document.createElement('div');
        this.lobbyModalContent.className = 'modal-content';
        this.lobbyModal.appendChild(this.lobbyModalContent);

        // Crear el botón de cierre del modal del lobby
        this.closeLobbyModalButton = document.createElement('span');
        this.closeLobbyModalButton.className = 'close';
        this.closeLobbyModalButton.textContent = '&times;';
        this.lobbyModalContent.appendChild(this.closeLobbyModalButton);

        // Crear el título del modal del lobby
        this.lobbyModalTitle = document.createElement('h2');
        this.lobbyModalTitle.textContent = 'Game Lobby';
        this.lobbyModalContent.appendChild(this.lobbyModalTitle);

        // Crear el contenido del modal del lobby
        this.lobbyModalText = document.createElement('p');
        this.lobbyModalText.id = 'gameLobbyModalContent';
        this.lobbyModalText.textContent = 'Lobby ID: (You shouldn\'t see this)';
        this.lobbyModalContent.appendChild(this.lobbyModalText);

        // Crear el modal del juego pausado
        this.pausedModal = document.createElement('div');
        this.pausedModal.id = 'gamePausedModal';
        this.pausedModal.className = 'modal';
        this.appendChild(this.pausedModal);

        // Crear el contenido del modal del juego pausado
        this.pausedModalContent = document.createElement('div');
        this.pausedModalContent.className = 'modal-content';
        this.pausedModal.appendChild(this.pausedModalContent);

        // Crear el botón de cierre del modal del juego pausado
        this.closePausedModalButton = document.createElement('span');
        this.closePausedModalButton.className = 'close';
        this.closePausedModalButton.textContent = '&times;';
        this.pausedModalContent.appendChild(this.closePausedModalButton);

        // Crear el título del modal del juego pausado
        this.pausedModalTitle = document.createElement('h2');
        this.pausedModalTitle.textContent = 'Game Paused';
        this.pausedModalContent.appendChild(this.pausedModalTitle);

        // Crear el contenido del modal del juego pausado
        this.pausedModalText = document.createElement('p');
        this.pausedModalText.id = 'gamePausedModalContent';
        this.pausedModalText.textContent = 'The game has been paused. When your partner is ready, the game will resume.';
        this.pausedModalContent.appendChild(this.pausedModalText);

        // Crear el modal del juego terminado
        this.endedModal = document.createElement('div');
        this.endedModal.id = 'gameEndedModal';
        this.endedModal.className = 'modal';
        this.endedModal.style.display = 'none';
        this.appendChild(this.endedModal);

        // Crear el contenido del modal del juego terminado
        this.endedModalContent = document.createElement('div');
        this.endedModalContent.className = 'modal-content';
        this.endedModal.appendChild(this.endedModalContent);

        // Crear el botón de cierre del modal del juego terminado
        this.closeEndedModalButton = document.createElement('span');
        this.closeEndedModalButton.className = 'close';
        this.closeEndedModalButton.textContent = '&times;';
        this.endedModalContent.appendChild(this.closeEndedModalButton);

        // Crear el título del modal del juego terminado
        this.endedModalTitle = document.createElement('h2');
        this.endedModalTitle.textContent = 'Game Over';
        this.endedModalContent.appendChild(this.endedModalTitle);

        // Crear el contenido del modal del juego terminado
        this.endedModalText = document.createElement('p');
        this.endedModalText.id = 'gameEndModalContent';
        this.endedModalContent.appendChild(this.endedModalText);

        // Crear el logo ISFT 151
        this.logoISFT151 = document.createElement('img');
        this.logoISFT151.src = '/assets/logo_ISFT_151.png';
        this.logoISFT151.alt = 'Logo ISFT 151';
        this.logoISFT151.id = 'logoISFT151';
        this.logoISFT151.style.position = 'absolute';
        this.logoISFT151.style.top = '0px';
        this.logoISFT151.style.right = '15px';
        this.logoISFT151.style.width = '10%';
        this.appendChild(this.logoISFT151);

        // Estilos para el elemento
        this.style.display = 'none';
    }

    connectedCallback() {
        // No es necesario aquí ya que los elementos se crean en el constructor
    }

    setView() {
        this.style.display = 'block';
    }
}

// Registrar el elemento personalizado 'game-main-view'
customElements.define('game-main-view', GameMainView);

export default GameMainView;
