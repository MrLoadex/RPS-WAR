class EventTarger {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    dispatchEvent(event, ...args) {
        if (this.events[event]) {
            // Esta línea itera sobre cada listener registrado para el evento especificado y llama a cada listener con los argumentos proporcionados.
            this.events[event].forEach(listener => {
                // Aquí se llama a cada listener con los argumentos pasados a emit, utilizando el operador de spread (...) 
                // para pasar los argumentos como parámetros individuales.
                listener(...args);
            });
        }
    }

    off(event, listenerToRemove) {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(listener => listener !== listenerToRemove);
    }
}