class GameView extends HTMLElement
{
	constructor()
	{
		super();
		this.gameLoginView = document.createElement('game-login-view');
		this.gameMainView = document.createElement('game-main-view');

		// Colección de vistas
		this.views = new Map();
		this.views.set('login', this.gameLoginView);
		this.views.set('game', this.gameMainView);
	}
	
	connectedCallback()
	{
		// Añadir las vistas al DOM del GameView
		this.appendChild(this.gameLoginView);
		this.appendChild(this.gameMainView);
	}
	
	init()
	{
		// Inicialización si es necesario
	}
	
	update()
	{
		// Iterar sobre toda la colección de objetos dibujables/renderizables/actualizables
	}
	
	setView(id)
	{
		let current = this.views.get(id);
		if (!current) return;
		
		// Ocultar todas las vistas
		this.views.forEach(view => view.style.display = 'none');
		// Mostrar la vista actual
		current.setView();
	}
	
	notify(data)
	{
		alert(data);
	}
};

// Registrar el elemento personalizado 'game-view'
customElements.define('game-view', GameView);
