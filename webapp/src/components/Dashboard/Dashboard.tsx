import React from 'react'

import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'

import { DashboardHome } from './DashboardHome'
import { DashboardStyledContainer } from './styled'

interface Props {
  children?: React.ReactNode
}

export function Dashboard(_props: Props): React.ReactNode {
  return (
    <DashboardStyledContainer>
      <Paper className="sidebar">
        <Tooltip title="Editor" arrow placement="right">
          <Button size="small">
            <i className="fas fa-edit fa-xl" />
          </Button>
        </Tooltip>
      </Paper>
      <div className="content">
        <DashboardHome />
      </div>
    </DashboardStyledContainer>
  )
}
