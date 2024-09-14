class MonoBehaviour {

    start()
    {
        throw new Error("start() debe ser implementado por las subclases");
    }

    update(){
        // Método virtual, esperado ser sobrescrito por las subclases
        throw new Error("update() debe ser implementado por las subclases");
    }

   
}