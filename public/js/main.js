import Application from "./Application.js";
function main()
{
    let game = new Application();
    game.init();
    game.start();
}

window.onload = main;