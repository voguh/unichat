import React from 'react'

import { Editor } from '@monaco-editor/react'
import Paper from '@mui/material/Paper'

import defaultCss from '~/assets/default-css.css?raw'

import { DashboardStyledContainer } from './styled'

interface Props {
  children?: React.ReactNode
}

export function Dashboard(props: Props): React.ReactNode {
  return (
    <DashboardStyledContainer>
      <Paper className="editor">
        <Editor theme="vs-dark" language="css" defaultValue={defaultCss} />
      </Paper>
      <Paper className="preview"></Paper>
    </DashboardStyledContainer>
  )
}
