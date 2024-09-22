import { invoke } from '@tauri-apps/api/tauri'

import { ContextMenuItem } from '~/types/contextMenu'

export const contextMenuItems: ContextMenuItem[] = [
  { icon: 'fas fa-bug', name: 'Open developer tools', action: () => invoke('open_devtools') }
]
