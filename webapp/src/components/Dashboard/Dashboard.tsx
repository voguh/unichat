import React from 'react'

import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'

import { DashboardHome } from './DashboardHome'
import { DashboardStyledContainer } from './styled'

const TABS = {
  home: { label: 'Home', icon: 'fas fa-edit fa-xl', component: DashboardHome },
  youtube: { label: 'YouTube', icon: 'fab fa-youtube fa-xl', component: () => <></> },
  twitch: { label: 'Twitch', icon: 'fab fa-twitch fa-xl', component: () => <></> }
}

interface Props {
  children?: React.ReactNode
}

export function Dashboard(_props: Props): React.ReactNode {
  const [selectedTab, setSelectedTab] = React.useState<keyof typeof TABS>('home')

  const ComponentRender = React.useCallback(() => {
    const Component = TABS[selectedTab].component

    return <Component />
  }, [selectedTab])

  return (
    <DashboardStyledContainer>
      <Paper className="sidebar">
        {Object.entries(TABS).map(([id, { icon, label }]) => (
          <Tooltip key={id} title={label} arrow placement="right">
            <Button size="small" onClick={() => setSelectedTab(id as keyof typeof TABS)}>
              <i className={icon} />
            </Button>
          </Tooltip>
        ))}
      </Paper>
      <div className="content">
        <ComponentRender />
      </div>
    </DashboardStyledContainer>
  )
}
