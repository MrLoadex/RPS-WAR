class GameObject {
    constructor(context) {
        this.context = context;
    }

    start()
    {
        throw new Error("start() debe ser implementado por las subclases");
    }

    update(){
        // Método virtual, esperado ser sobrescrito por las subclases
        throw new Error("update() debe ser implementado por las subclases");
    }
    
    draw(){
        // Método virtual, esperado ser sobrescrito por las subclases
        throw new Error("draw() debe ser implementado por las subclases");
    }

    checkCollision()
    {
         throw new Error("checkCollision() debe ser implementado por las subclases");
    }
   
}