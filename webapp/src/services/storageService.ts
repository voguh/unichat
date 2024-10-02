import { createStore, Store } from '@tauri-apps/plugin-store'

export class StorageService {
  private readonly _listeners: Map<string, ((key: string, value: any) => void)[]>
  private _store: Store

  constructor() {
    this._listeners = new Map()
  }

  public async createStore(): Promise<void> {
    this._store = await createStore('unichat.db')
  }

  public async getItem<T>(key: string): Promise<T> {
    try {
      if (this._store == null) {
        await this.createStore()
      }

      return this._store.get<T>(key)
    } catch (err) {
      console.error(err)

      return null
    }
  }

  public async setItem<T>(key: string, value: T): Promise<void> {
    try {
      if (this._store == null) {
        await this.createStore()
      }

      await this._store.set(key, value)

      const listeners = this._listeners.get(key)
      for (const listener of listeners ?? []) {
        listener(key, value)
      }

      await this._store.save()
    } catch (err) {
      console.error(err)
    }
  }

  public addEventListener<T>(key: string, cb: (key: string, value: T) => void): void {
    let listeners = this._listeners.get(key)
    if (listeners == null) {
      listeners = []
    }

    listeners.push(cb)

    this._listeners.set(key, listeners)
  }

  public removeEventListener<T>(key: string, cb: (key: string, value: T) => void): void {
    let listeners = this._listeners.get(key)

    if (listeners != null) {
      listeners = listeners.filter((item) => item !== cb)
    }

    this._listeners.set(key, listeners)
  }
}

export const storageService = new StorageService()
