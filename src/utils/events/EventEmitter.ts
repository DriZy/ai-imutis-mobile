type Listener = (data: any) => void;

class EventEmitter {
    private listeners: { [key: string]: Listener[] } = {};

    on(event: string, listener: Listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
        return () => this.off(event, listener);
    }

    off(event: string, listener: Listener) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    }

    emit(event: string, data?: any) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(listener => listener(data));
    }
}

export const eventEmitter = new EventEmitter();
export const EVENTS = {
    API_ERROR: 'API_ERROR',
    SHOW_TOAST: 'SHOW_TOAST',
};
