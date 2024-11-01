class GameMainView extends HTMLElement
{
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <!-- Contenido del GameMainView, por ejemplo, el canvas -->
            <canvas id="gameCanvas"></canvas>
            <!-- Otros elementos necesarios -->
        `;
        this.style.display = 'none';
    }

    setView() {
        this.style.display = 'block';
    }
}

// Registrar el elemento personalizado 'game-main-view'
customElements.define('game-main-view', GameMainView);

export default GameMainView;
