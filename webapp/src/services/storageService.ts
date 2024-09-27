import { invoke } from '@tauri-apps/api/core'

export class StorageService {
  public async getItem<T>(key: string): Promise<T> {
    try {
      const response = await invoke<string>('select_from_settings', { key })
      if (response == null) {
        return null
      }

      return JSON.parse(response)
    } catch (e) {
      return null
    }
  }

  public async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await invoke('save_in_settings', { key, value: JSON.stringify(value) })
    } catch (e) {
      console.log(e)
    }
  }
}

export const storageService = new StorageService()
