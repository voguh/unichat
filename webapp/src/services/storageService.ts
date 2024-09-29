import { Store } from '@tauri-apps/plugin-store'

export class StorageService {
  private _store: Store

  constructor() {
    this._store = new Store('unichat.db')
  }

  public async getItem<T>(key: string): Promise<T> {
    try {
      const response = await this._store.get<string>(key)
      if (response == null) {
        return null
      }

      return JSON.parse(response)
    } catch (_err) {
      return null
    }
  }

  public async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await this._store.set(key, JSON.stringify(value))
    } catch (e) {
      console.log(e)
    }
  }
}

export const storageService = new StorageService()
