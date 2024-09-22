export interface ContextMenuContentItem {
  icon: string
  name: string
  action(): Promise<void>
}

export interface ContextMenuItemDivider {
  divider: true
}

export type ContextMenuItem = ContextMenuContentItem | ContextMenuItemDivider
