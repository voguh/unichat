import React from 'react'

import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import { invoke } from '@tauri-apps/api/core'

import { DashboardHome } from './DashboardHome'
import { DashboardStyledContainer } from './styled'

const TABS = {
  editor: { icon: 'fas fa-edit fa-xl', component: DashboardHome },
  youtube: { icon: 'fab fa-youtube fa-xl', component: () => <></> },
  twitch: { icon: 'fab fa-twitch fa-xl', component: () => <></> }
}

interface Props {
  children?: React.ReactNode
}

export function Dashboard(_props: Props): React.ReactNode {
  const [selectedTab, setSelectedTab] = React.useState<keyof typeof TABS>('editor')

  const ComponentRender = React.useCallback(() => {
    const Component = TABS[selectedTab].component

    return <Component />
  }, [selectedTab])

  React.useEffect(() => {
    async function init(): Promise<void> {
      await invoke('hide_webview', { label: `youtube-chat` })
      await invoke('hide_webview', { label: `twitch-chat` })

      if (selectedTab !== 'editor') {
        await invoke('show_webview', { label: `${selectedTab}-chat` })
      }
    }

    init()
  }, [selectedTab])

  return (
    <DashboardStyledContainer>
      <Paper className="sidebar">
        {Object.entries(TABS).map(([id, { icon }]) => (
          <Button key={id} size="small" onClick={() => setSelectedTab(id as keyof typeof TABS)}>
            <i className={icon} />
          </Button>
        ))}
      </Paper>
      <div className="content">
        <ComponentRender />
      </div>
    </DashboardStyledContainer>
  )
}
