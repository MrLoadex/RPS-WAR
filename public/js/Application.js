import GameModel from "./GameModel.js";
import GameView from "./GameView.js";

import GameController from "./GameController.js";


class Application
{
	constructor()
	{
		this.model = new GameModel();
		this.view = new GameView();
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

export default Application;

