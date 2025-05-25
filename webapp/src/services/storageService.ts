import { invoke } from "@tauri-apps/api/core";

export class StorageService {
  private readonly _listeners: Map<string, ((key: string, value: any) => void)[]>;

  constructor() {
    this._listeners = new Map();
  }

  public async getItem<T>(key: string): Promise<T> {
    try {
      return invoke<T>("store_get_item", { key });
    } catch (err) {
      console.error(err);

      return null;
    }
  }

  public async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const listeners = this._listeners.get(key);
      for (const listener of listeners ?? []) {
        listener(key, value);
      }

      return invoke<void>("store_set_item", { key, value });
    } catch (err) {
      console.error(err);
    }
  }

  public addEventListener<T>(key: string, cb: (key: string, value: T) => void): void {
    let listeners = this._listeners.get(key);
    if (listeners == null) {
      listeners = [];
    }

    listeners.push(cb);

    this._listeners.set(key, listeners);
  }

  public removeEventListener<T>(key: string, cb: (key: string, value: T) => void): void {
    let listeners = this._listeners.get(key);

    if (listeners != null) {
      listeners = listeners.filter((item) => item !== cb);
    }

    this._listeners.set(key, listeners);
  }
}

export const storageService = new StorageService();
