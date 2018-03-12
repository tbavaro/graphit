type Listener = () => void;

export interface Listenable {
  addListener: (func: Listener) => void;
  removeListener: (func: Listener) => boolean;
  signalUpdate: () => void;
}

export class SimpleListenable {
  private _listeners: Set<Listener> = new Set<Listener>();

  addListener(func: Listener) {
    this._listeners.add(func);
  }

  removeListener(func: Listener) {
    return this._listeners.delete(func);
  }

  signalUpdate() {
    this._listeners.forEach((func) => func());
  }
}
