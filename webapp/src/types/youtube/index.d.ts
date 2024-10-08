import { AddBannerToLiveChatCommand } from './addBannerToLiveChatCommand'
import { AddChatItemAction } from './addChatItemAction'
import { RemoveChatItemAction } from './removeChatItemAction'
import { RemoveChatItemByAuthorAction } from './removeChatItemByAuthorAction'

// eslint-disable-next-line prettier/prettier
export type YouTubeAction = AddChatItemAction | RemoveChatItemAction | RemoveChatItemByAuthorAction | AddBannerToLiveChatCommand | AddLiveChatTickerItemAction
