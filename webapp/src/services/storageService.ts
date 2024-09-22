import { Store } from '@tauri-apps/plugin-store'

export class StorageService {
  private readonly _store: Store

  constructor() {
    this._store = new Store('unichat.db')
  }

  public async getItem<T>(key: string): Promise<T> {
    return await this._store.get<T>(key)
  }

  public async setItem<T>(key: string, value: T): Promise<void> {
    await this._store.set(key, value)
  }
}

export const storageService = new StorageService()
