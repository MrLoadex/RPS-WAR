class Application
{
	constructor()
	{
		this.model = new GameModel();
		this.view = document.createElement('game-view');
		document.body.appendChild(this.view);
		this.controller = new GameController( this.model, this.view );
		
		
	};
	
	init()
	{
		
	}
	
	start()
	{
		this.controller.init();
	}
	
	pause()
	{
		
	}
	
	quit()
	{
		
	}
	
	
};
