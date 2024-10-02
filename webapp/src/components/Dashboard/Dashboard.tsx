import React from 'react'

import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import { invoke } from '@tauri-apps/api/core'

import { storageService } from '~/services/storageService'
import { TWITCH_CHAT_URL_KEY, YOUTUBE_CHAT_URL_KEY } from '~/utils/constants'
import { Strings } from '~/utils/Strings'

import { DashboardEditor } from './DashboardEditor'
import { DashboardHome } from './DashboardHome'
import { DashboardStyledContainer } from './styled'

const TABS = {
  home: { icon: 'fas fa-home fa-xl', component: DashboardHome },
  editor: { icon: 'fas fa-edit fa-xl', component: DashboardEditor },
  youtube: { icon: 'fab fa-youtube fa-xl', component: () => <></> },
  twitch: { icon: 'fab fa-twitch fa-xl', component: () => <></> }
}

interface Props {
  children?: React.ReactNode
}

export function Dashboard(_props: Props): React.ReactNode {
  const [selectedTab, setSelectedTab] = React.useState<keyof typeof TABS>('home')
  const [webviewsStatus, setWebviewsStatus] = React.useState({} as Record<keyof typeof TABS, boolean>)

  const ComponentRender = React.useCallback(() => {
    const Component = TABS[selectedTab].component

    return <Component />
  }, [selectedTab])

  React.useEffect(() => {
    async function init(): Promise<void> {
      await invoke('hide_webviews')

      if (['home', 'editor'].every((noWebviewTab) => noWebviewTab !== selectedTab)) {
        await invoke('show_webview', { label: `${selectedTab}-chat` })
      }
    }

    init()
  }, [selectedTab])

  React.useEffect(() => {
    async function onKeyChange(key: string, value: string): Promise<void> {
      const type = key.match(/unichat::(youtube|twitch)-chat-url/)[1]

      if (Strings.isValidChatUrl(type, value)) {
        await invoke('update_webview_url', { label: `${type}-chat`, url: value })
        setWebviewsStatus((old) => ({ ...old, [type]: true }))
      } else {
        await invoke('update_webview_url', { label: `${type}-chat`, url: 'about:blank' })
        setWebviewsStatus((old) => ({ ...old, [type]: false }))
      }
    }

    storageService.getItem<string>(YOUTUBE_CHAT_URL_KEY).then((v) => onKeyChange(YOUTUBE_CHAT_URL_KEY, v))
    storageService.getItem<string>(TWITCH_CHAT_URL_KEY).then((v) => onKeyChange(TWITCH_CHAT_URL_KEY, v))
    storageService.addEventListener(YOUTUBE_CHAT_URL_KEY, onKeyChange)
    storageService.addEventListener(TWITCH_CHAT_URL_KEY, onKeyChange)

    return () => {
      storageService.removeEventListener(YOUTUBE_CHAT_URL_KEY, onKeyChange)
      storageService.removeEventListener(TWITCH_CHAT_URL_KEY, onKeyChange)
    }
  }, [])

  return (
    <DashboardStyledContainer>
      <Paper className="sidebar">
        {Object.entries(TABS).map(([id, { icon }]) => {
          const validUrl = webviewsStatus[id as keyof typeof TABS] ?? false

          return (
            <Button
              key={id}
              size="small"
              variant={id === selectedTab ? 'contained' : 'text'}
              onClick={() => setSelectedTab(id as keyof typeof TABS)}
            >
              <i className={icon} />
              {['home', 'editor'].every((noWebviewTab) => noWebviewTab !== id) && (
                <div
                  className="active"
                  style={{ background: `var(--mui-palette-Alert-${validUrl ? 'successFilledBg' : 'errorFilledBg'})` }}
                />
              )}
            </Button>
          )
        })}
      </Paper>
      <div className="content">
        <ComponentRender />
      </div>
    </DashboardStyledContainer>
  )
}
